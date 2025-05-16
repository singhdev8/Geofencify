
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

const INDIA_CENTER = [20.5937, 78.9629];
const INITIAL_ZOOM_INDIA = 5;
const USER_LOCATION_ZOOM = 15;

export default function useMapControls(currentLocation, geofences) {
  const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM_INDIA);
  const [initialLocationStrategyApplied, setInitialLocationStrategyApplied] = useState(false);
  const mapRef = useRef();
  const { toast } = useToast();

  useEffect(() => {
    if (!initialLocationStrategyApplied) {
      if (currentLocation) {
        const userCoords = [currentLocation.latitude, currentLocation.longitude];
        setMapCenter(userCoords);
        setMapZoom(USER_LOCATION_ZOOM);
        if (mapRef.current) mapRef.current.flyTo(userCoords, USER_LOCATION_ZOOM);
        setInitialLocationStrategyApplied(true);
      } else if (geofences && geofences.length > 0) {
        const firstGeofenceCenter = geofences[0].center;
        setMapCenter([firstGeofenceCenter.lat, firstGeofenceCenter.lng]);
        setMapZoom(USER_LOCATION_ZOOM - 2); 
        setInitialLocationStrategyApplied(true);
      } else {
         setMapCenter(INDIA_CENTER);
         setMapZoom(INITIAL_ZOOM_INDIA);
         setInitialLocationStrategyApplied(true); 
      }
    } else if (currentLocation && mapCenter && (mapCenter[0] === INDIA_CENTER[0] && mapCenter[1] === INDIA_CENTER[1])) {
       if (!geofences || geofences.length === 0) {
        const userCoords = [currentLocation.latitude, currentLocation.longitude];
        setMapCenter(userCoords);
        setMapZoom(USER_LOCATION_ZOOM);
        if (mapRef.current) mapRef.current.flyTo(userCoords, USER_LOCATION_ZOOM);
      }
    }
  }, [currentLocation, initialLocationStrategyApplied, mapCenter, geofences]);


  const handleMapClick = (latlng, setManualLat, setManualLng) => {
    setManualLat(latlng.lat.toFixed(6));
    setManualLng(latlng.lng.toFixed(6));
    toast({ title: "Map Clicked", description: `Ready to set new geofence at Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}` });
  };
  
  const flyToLocation = (lat, lng, zoom) => {
    if(mapRef.current) {
        mapRef.current.flyTo([lat, lng], zoom);
        setMapCenter([lat, lng]);
        setMapZoom(zoom);
    }
  };

  return {
    mapCenter,
    mapZoom,
    mapRef,
    setMapCenter,
    setMapZoom,
    handleMapClick,
    flyToLocation,
    USER_LOCATION_ZOOM,
    INITIAL_ZOOM_INDIA,
    INDIA_CENTER
  };
}
