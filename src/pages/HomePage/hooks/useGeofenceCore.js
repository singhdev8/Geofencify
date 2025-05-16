
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { isPointInGeofence, areGeofencesOverlapping } from '@/lib/geofenceUtils';
import { v4 as uuidv4 } from 'uuid';


export default function useGeofenceManager(currentLocation, definedGeofences, setDefinedGeofences, eventLog, setEventLog, showNotification) {
  const [activeZoneIds, setActiveZoneIds] = useState([]);
  const { toast } = useToast();
  const MAX_RADIUS = 500;


  const assignGroupId = (newGeofence, existingGeofences) => {
    let assignedGroupId = null;
    const overlappingGroupIds = new Set();
    let isNewGroupRestricted = newGeofence.isRestricted;

    for (const existing of existingGeofences) {
      if (areGeofencesOverlapping(newGeofence, existing)) {
        if (existing.groupId) {
          overlappingGroupIds.add(existing.groupId);
          if (existing.isRestricted) isNewGroupRestricted = true; 
        }
      }
    }

    if (overlappingGroupIds.size > 0) {
      assignedGroupId = Array.from(overlappingGroupIds).sort()[0]; 
    } else {
      assignedGroupId = `group-${uuidv4()}`; 
    }
    
    const updatedGeofences = existingGeofences.map(gf => {
        if (gf.groupId && overlappingGroupIds.has(gf.groupId)) {
            return {...gf, groupId: assignedGroupId, isRestricted: gf.isRestricted || isNewGroupRestricted };
        }
        return gf;
    });
    
    return { groupId: assignedGroupId, isRestricted: isNewGroupRestricted, updatedGeofences };
  };


  const addGeofenceZone = (center, radius, isRestricted) => {
    if (radius > MAX_RADIUS) {
        toast({ title: "Radius Exceeded", description: `Maximum radius is ${MAX_RADIUS}m.`, variant: "destructive"});
        return;
    }
    if (!center || !radius) {
        toast({ title: "Invalid Geofence", description: "Center and radius must be defined.", variant: "destructive"});
        return;
    }

    const newGeofence = {
      id: `zone-${uuidv4()}`,
      center: { lat: center.lat, lng: center.lng },
      radius: parseFloat(radius),
      isRestricted: isRestricted,
      groupId: null, 
    };

    let finalGeofences = [...definedGeofences];
    const { groupId, isRestricted: groupIsRestricted, updatedGeofences } = assignGroupId(newGeofence, finalGeofences);
    newGeofence.groupId = groupId;
    newGeofence.isRestricted = groupIsRestricted; 

    finalGeofences = [...updatedGeofences, newGeofence].map(gf => 
        gf.groupId === groupId ? { ...gf, isRestricted: groupIsRestricted } : gf
    );
    
    setDefinedGeofences(finalGeofences);
    toast({ title: "Geofence Zone Added", description: `Zone ID: ${newGeofence.id}, Group: ${newGeofence.groupId}${groupIsRestricted ? ' (Restricted)' : ''}` });
  };


  useEffect(() => {
    if (!currentLocation || definedGeofences.length === 0) {
      if (activeZoneIds.length > 0) {
          const now = new Date().toISOString();
          const updatedLog = eventLog.map(logEntry => {
              if (activeZoneIds.includes(logEntry.zoneId) && !logEntry.exitTime) {
                  return { ...logEntry, exitTime: now, status: 'Exited (Location Lost)' };
              }
              return logEntry;
          });
          setEventLog(updatedLog);
          setActiveZoneIds([]);
      }
      return;
    }

    const groupsCurrentlyIn = new Map(); 

    definedGeofences.forEach(gf => {
        if (isPointInGeofence(currentLocation, gf.center, gf.radius)) {
            if (!groupsCurrentlyIn.has(gf.groupId) || (!groupsCurrentlyIn.get(gf.groupId).isRestricted && gf.isRestricted)) {
                 groupsCurrentlyIn.set(gf.groupId, { isRestricted: gf.isRestricted, geofence: gf });
            } else if (groupsCurrentlyIn.has(gf.groupId) && groupsCurrentlyIn.get(gf.groupId).isRestricted && !gf.isRestricted) {
            } else if (!groupsCurrentlyIn.has(gf.groupId)) {
                 groupsCurrentlyIn.set(gf.groupId, { isRestricted: gf.isRestricted, geofence: gf });
            }
        }
    });
    
    const now = new Date().toISOString();
    let logChanged = false;
    const newActiveZoneIds = Array.from(groupsCurrentlyIn.keys());

    groupsCurrentlyIn.forEach((groupInfo, groupId) => {
        const existingLogEntry = eventLog.find(e => e.zoneId === groupId && !e.exitTime);
        if (!existingLogEntry) {
            const representativeFence = groupInfo.geofence;
            setEventLog(prevLog => [{
                id: uuidv4(),
                zoneId: groupId,
                entryTime: now,
                exitTime: null,
                status: 'Entered',
                center: representativeFence.center,
                radius: representativeFence.radius,
                isRestricted: groupInfo.isRestricted,
            }, ...prevLog.slice(0,199)]);
            showNotification(
                `Entered ${groupInfo.isRestricted ? "Restricted " : ""}Zone`, 
                `You entered Zone Group: ${groupId}.${groupInfo.isRestricted ? " Mic/Camera should be OFF." : ""}`,
                groupInfo.isRestricted ? "warning" : "default"
            );
            logChanged = true;
        }
    });

    activeZoneIds.forEach(activeGroupId => {
        if (!groupsCurrentlyIn.has(activeGroupId)) {
            const exitedLogEntry = eventLog.find(e => e.zoneId === activeGroupId && !e.exitTime);
            setEventLog(prevLog => prevLog.map(e => 
                e.zoneId === activeGroupId && !e.exitTime ? { ...e, exitTime: now, status: 'Exited' } : e
            ));
            
            if (exitedLogEntry) {
                showNotification(
                    `Exited ${exitedLogEntry.isRestricted ? "Restricted " : ""}Zone`, 
                    `You exited Zone Group: ${activeGroupId}.`
                );
            } else {
                 const lastKnownFenceInGroup = definedGeofences.find(df => df.groupId === activeGroupId);
                 showNotification(
                    `Exited ${lastKnownFenceInGroup?.isRestricted ? "Restricted " : ""}Zone`, 
                    `You exited Zone Group: ${activeGroupId}.`
                );
            }
            logChanged = true;
        }
    });
    
    if (logChanged || JSON.stringify(newActiveZoneIds.sort()) !== JSON.stringify(activeZoneIds.sort())) {
        setActiveZoneIds(newActiveZoneIds);
    }

  }, [currentLocation, definedGeofences, showNotification, toast, activeZoneIds, eventLog, setEventLog]);


  const clearAllGeofences = () => {
    const now = new Date().toISOString();
    const updatedLog = eventLog.map(logEntry => {
        if (activeZoneIds.includes(logEntry.zoneId) && !logEntry.exitTime) {
            return { ...logEntry, exitTime: now, status: 'Exited (Cleared)' };
        }
        return logEntry;
    });
    setEventLog(updatedLog);
    setDefinedGeofences([]);
    setActiveZoneIds([]);
    toast({ title: "All Geofence Zones Cleared" });
  };
  
  return { addGeofenceZone, clearAllGeofences, activeZoneIds, MAX_RADIUS };
}
