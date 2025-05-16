
import React from 'react';
import { useMapEvents, Marker } from 'react-leaflet';

const MapEventsHandler = ({ onMapClick, geofenceCenter }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return geofenceCenter ? <Marker position={geofenceCenter} /> : null;
};

export default MapEventsHandler;
