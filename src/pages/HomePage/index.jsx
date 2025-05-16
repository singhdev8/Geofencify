
import React from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

import useHomePageState from './hooks/useHomePageState';
import GeofenceSetupCard from './components/GeofenceSetupCard';
import StatusDisplay from './StatusDisplay';
import EventLogCard from './components/EventLogCard';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function HomePage() {
  const {
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
    overallGeofenceStatus
  } = useHomePageState();
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const renderOverallStatus = () => {
    const status = overallGeofenceStatus();
    let IconComponent = null;
    if (status.icon === "CheckCircle2") IconComponent = CheckCircle2;
    else if (status.icon === "AlertTriangle") IconComponent = AlertTriangle;
    else if (status.icon === "ShieldAlert") IconComponent = ShieldAlert;

    return <p className={`${status.color} flex items-center`}>{IconComponent && <IconComponent className="mr-2 h-5 w-5" />} {status.text}</p>;
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <GeofenceSetupCard
        mapCenter={mapCenter}
        mapZoom={mapZoom}
        currentLocation={currentLocation}
        definedGeofences={definedGeofences}
        onMapClick={(latlng) => handleMapClickCtrl(latlng, setManualLat, setManualLng)}
        mapRef={mapRef}
        manualLat={manualLat}
        setManualLat={setManualLat}
        manualLng={manualLng}
        setManualLng={setManualLng}
        currentGeofenceRadius={currentGeofenceRadius}
        setCurrentGeofenceRadius={setCurrentGeofenceRadius}
        isCurrentGeofenceRestricted={isCurrentGeofenceRestricted}
        setIsCurrentGeofenceRestricted={setIsCurrentGeofenceRestricted}
        handleAddGeofence={handleAddGeofence}
        handleClearAllGeofences={clearAllGeofences}
        MAX_RADIUS={MAX_RADIUS}
      />

      <StatusDisplay 
        locationLoading={locationLoading}
        locationError={locationError}
        currentLocation={currentLocation}
        geofenceStatusComponent={renderOverallStatus()}
      />
      
      <EventLogCard 
        eventLog={eventLog} 
        activeZoneIds={activeZoneIds} 
        definedGeofences={definedGeofences}
      />
      
      <motion.div variants={itemVariants} className="text-center text-sm text-slate-500 mt-8">
        <p>GeoGuard uses OpenStreetMap for mapping. Max geofence radius: {MAX_RADIUS}m.</p>
      </motion.div>
    </motion.div>
  );
}

export default HomePage;
