
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import MapComponent from '../MapComponent';
import GeofenceControls from '../GeofenceControls';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const GeofenceSetupCard = ({
  mapCenter,
  mapZoom,
  currentLocation,
  definedGeofences,
  onMapClick,
  mapRef,
  manualLat,
  setManualLat,
  manualLng,
  setManualLng,
  currentGeofenceRadius,
  setCurrentGeofenceRadius,
  isCurrentGeofenceRestricted,
  setIsCurrentGeofenceRestricted,
  handleAddGeofence,
  handleClearAllGeofences,
  MAX_RADIUS,
}) => {
  return (
    <Card as={motion.div} variants={itemVariants} className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center"><MapPin className="mr-2 h-7 w-7 text-teal-400" /> Geofence Setup</CardTitle>
        <CardDescription>Click map or enter coordinates to set potential geofence center. Adjust radius, mark if restricted, and click 'Add Geofence Zone'. Overlapping zones will be grouped.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <MapComponent 
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          currentLocation={currentLocation}
          definedGeofences={definedGeofences}
          onMapClick={onMapClick}
          mapRef={mapRef}
        />
        <GeofenceControls 
          manualLat={manualLat}
          setManualLat={setManualLat}
          manualLng={manualLng}
          setManualLng={setManualLng}
          currentGeofenceRadius={currentGeofenceRadius}
          setCurrentGeofenceRadius={setCurrentGeofenceRadius}
          isCurrentGeofenceRestricted={isCurrentGeofenceRestricted}
          setIsCurrentGeofenceRestricted={setIsCurrentGeofenceRestricted}
          handleAddGeofence={handleAddGeofence}
          handleClearAllGeofences={handleClearAllGeofences}
          maxRadius={MAX_RADIUS}
        />
      </CardContent>
    </Card>
  );
};

export default GeofenceSetupCard;
