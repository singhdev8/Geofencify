
import React from 'react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import usePersistentState from './usePersistentState';
import useGeolocation from '@/hooks/useGeolocation';
import useNotificationHandler from './useNotificationHandler';
import useMapControls from './useMapControls';
import useGeofenceManager from './useGeofenceCore';

export default function useHomePageState() {
  const { location: currentLocation, error: locationError, loading: locationLoading } = useGeolocation();
  const { toast } = useToast();
  
  const [definedGeofences, setDefinedGeofences] = usePersistentState('definedGeofences_v3', []);
  const [eventLog, setEventLog] = usePersistentState('geofenceEventLog_v3', []);
  
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [currentGeofenceRadius, setCurrentGeofenceRadius] = useState(200); 
  const [isCurrentGeofenceRestricted, setIsCurrentGeofenceRestricted] = useState(false);

  const { requestNotificationPermission, showNotification } = useNotificationHandler();
  
  const { 
    addGeofenceZone, 
    clearAllGeofences, 
    activeZoneIds,
    MAX_RADIUS
  } = useGeofenceManager(
    currentLocation, 
    definedGeofences, 
    setDefinedGeofences, 
    eventLog, 
    setEventLog, 
    showNotification
  );

  const { 
    mapCenter, mapZoom, mapRef, 
    handleMapClick: handleMapClickCtrl,
    flyToLocation,
    USER_LOCATION_ZOOM
  } = useMapControls(currentLocation, definedGeofences);

  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  const handleAddGeofence = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({ title: "Invalid Coordinates", description: "Please enter valid latitude and longitude for the geofence center.", variant: "destructive" });
      return;
    }
    if (currentGeofenceRadius <= 0) {
      toast({ title: "Invalid Radius", description: "Geofence radius must be positive.", variant: "destructive" });
      return;
    }
    addGeofenceZone({ lat, lng }, currentGeofenceRadius, isCurrentGeofenceRestricted);
    flyToLocation(lat, lng, USER_LOCATION_ZOOM -1);
    setIsCurrentGeofenceRestricted(false); 
  };

  return {
    currentLocation, locationError, locationLoading,
    definedGeofences, eventLog,
    manualLat, setManualLat,
    manualLng, setManualLng,
    currentGeofenceRadius, setCurrentGeofenceRadius,
    isCurrentGeofenceRestricted, setIsCurrentGeofenceRestricted,
    activeZoneIds, MAX_RADIUS,
    mapCenter, mapZoom, mapRef,
    handleMapClickCtrl,
    handleAddGeofence,
    clearAllGeofences,
    overallGeofenceStatus: () => {
      if (definedGeofences.length === 0) return { text: "No geofence zones defined.", color: "text-slate-400", icon: null };
      if (activeZoneIds.length > 0) {
        const activeRestricted = activeZoneIds.some(zoneId => {
          const groupFences = definedGeofences.filter(gf => gf.groupId === zoneId);
          return groupFences.some(gf => gf.isRestricted);
        });
        return { 
          text: `Currently INSIDE Zone(s): ${activeZoneIds.join(', ')}`, 
          color: activeRestricted ? "text-amber-400" : "text-green-400",
          icon: activeRestricted ? "ShieldAlert" : "CheckCircle2"
        };
      }
      return { text: "Currently OUTSIDE all defined zones.", color: "text-orange-400", icon: "AlertTriangle" };
    }
  };
}
