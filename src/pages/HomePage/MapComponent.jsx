
import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import MapEventsHandler from './MapEventsHandler';
import { ShieldAlert } from 'lucide-react';

const MapComponent = ({ 
  mapCenter, 
  mapZoom, 
  currentLocation, 
  definedGeofences,
  onMapClick, 
  mapRef 
}) => {
  
  const userLocationIcon = L.icon({ 
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', 
    iconSize: [25,41], 
    iconAnchor: [12,41], 
    popupAnchor: [1,-34], 
    tooltipAnchor: [16,-28], 
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', 
    shadowSize: [41,41]
  });

  const getGroupColor = (groupId, isRestricted) => {
    if (isRestricted) return 'hsl(var(--destructive))'; 
    const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(180, 70%, 50%)', 'hsl(300, 70%, 50%)', 'hsl(60, 70%, 50%)'];
    return colors[Math.abs(groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length];
  };

  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border border-slate-700">
      {mapCenter && (
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }} 
          whenCreated={mapInstance => { mapRef.current = mapInstance; }}
          key={mapCenter.join(',') + '-' + mapZoom} 
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEventsHandler onMapClick={onMapClick} />
          {currentLocation && (
            <Marker 
              position={[currentLocation.latitude, currentLocation.longitude]} 
              icon={userLocationIcon}
            >
              <Popup>Your current location</Popup>
            </Marker>
          )}
          
          <FeatureGroup>
            {definedGeofences.map((gf) => (
              <Circle 
                key={gf.id}
                center={gf.center} 
                radius={gf.radius} 
                pathOptions={{ 
                  color: getGroupColor(gf.groupId || gf.id, gf.isRestricted), 
                  fillColor: getGroupColor(gf.groupId || gf.id, gf.isRestricted), 
                  fillOpacity: gf.isRestricted ? 0.35 : 0.2 
                }}
              >
                <Popup>
                  Zone ID: {gf.id}<br/>
                  Group ID: {gf.groupId}<br/>
                  Radius: {gf.radius}m<br/>
                  {gf.isRestricted && <span className="flex items-center font-semibold text-destructive"><ShieldAlert className="h-4 w-4 mr-1" />Restricted Zone</span>}
                </Popup>
              </Circle>
            ))}
          </FeatureGroup>

        </MapContainer>
      )}
      {!mapCenter && <div className="flex items-center justify-center h-full bg-slate-800 text-slate-300">Loading map...</div>}
    </div>
  );
};

export default MapComponent;
