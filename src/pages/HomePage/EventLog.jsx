
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Clock, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';

const EventLog = ({ eventLog, activeZoneIds, definedGeofences }) => {
  if (!eventLog || eventLog.length === 0) {
    return <p className="text-slate-400 text-center py-4">No geofence events recorded yet.</p>;
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getZoneInfo = (zoneId) => {
    const geofenceInGroup = definedGeofences.find(gf => gf.groupId === zoneId);
    return geofenceInGroup || { center: {lat:0, lng:0}, radius: 0, isRestricted: false };
  };

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border border-slate-700 bg-slate-800/30 p-4">
      <div className="space-y-3">
        {eventLog.map((event, index) => {
          const isActive = activeZoneIds.includes(event.zoneId);
          const isExited = event.status === 'Exited' || (event.exitTime && !isActive);
          const zoneInfo = getZoneInfo(event.zoneId);
          
          let statusText = event.status;
          let statusColor = 'text-slate-300';
          let borderColor = 'border-slate-500';
          let bgColor = 'bg-slate-700/30';
          let Icon = Clock;

          if (isActive) {
            statusText = 'Currently Inside';
            statusColor = zoneInfo.isRestricted ? 'text-amber-300' : 'text-green-300';
            borderColor = zoneInfo.isRestricted ? 'border-amber-500' : 'border-green-500';
            bgColor = zoneInfo.isRestricted ? 'bg-amber-600/30' : 'bg-green-600/30';
            Icon = zoneInfo.isRestricted ? ShieldAlert : LogIn;
          } else if (isExited) {
            statusText = 'Exited';
            statusColor = 'text-red-300';
            borderColor = 'border-red-500';
            bgColor = 'bg-red-600/30';
            Icon = LogOut;
          } else if (event.status === 'Entered' && !event.exitTime) {
             statusText = 'Entered (Awaiting Exit)';
             statusColor = 'text-yellow-300';
             borderColor = 'border-yellow-500';
             bgColor = 'bg-yellow-600/30';
             Icon = LogIn;
          }


          return (
            <motion.div
              key={event.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start p-3 rounded-lg shadow-md ${bgColor} border-l-4 ${borderColor}`}
            >
              <Icon className={`h-5 w-5 mr-3 mt-1 ${statusColor} flex-shrink-0`} />
              <div className="flex-grow">
                <p className={`font-semibold ${statusColor}`}>
                  Zone Group ID: {event.zoneId} - {statusText}
                  {zoneInfo.isRestricted && <ShieldAlert className="inline h-4 w-4 ml-2 text-amber-400" title="Restricted Zone"/>}
                </p>
                <div className="text-xs text-slate-400 space-y-0.5 mt-1">
                  <p className="flex items-center">
                    <LogIn className="h-3 w-3 mr-1.5 text-green-400" /> Entry: {formatTimestamp(event.entryTime)}
                  </p>
                  {event.exitTime && (
                    <p className="flex items-center">
                      <LogOut className="h-3 w-3 mr-1.5 text-red-400" /> Exit: {formatTimestamp(event.exitTime)}
                    </p>
                  )}
                  <p className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1.5 text-sky-400" /> Approx. Center: Lat {event.center.lat.toFixed(3)}, Lng {event.center.lng.toFixed(3)}
                  </p>
                  <p className="flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1.5 text-teal-400" /> Approx. Radius: {event.radius}m
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default EventLog;
