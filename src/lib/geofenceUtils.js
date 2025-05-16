
import React from 'react';

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d * 1000; 
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export function isPointInGeofence(point, geofenceCenter, geofenceRadius) {
  if (!point || !geofenceCenter || geofenceRadius === undefined) {
    return false;
  }
  
  const geofenceCenterObj = geofenceCenter.lat && geofenceCenter.lng ? 
    { latitude: geofenceCenter.lat, longitude: geofenceCenter.lng } : 
    geofenceCenter;

  const distance = calculateDistance(
    point.latitude,
    point.longitude,
    geofenceCenterObj.latitude,
    geofenceCenterObj.longitude
  );
  return distance <= geofenceRadius;
}

export function areGeofencesOverlapping(g1, g2) {
  if (!g1 || !g2 || !g1.center || !g2.center || !g1.radius || !g2.radius) return false;
  const distance = calculateDistance(g1.center.lat, g1.center.lng, g2.center.lat, g2.center.lng);
  return distance < (parseFloat(g1.radius) + parseFloat(g2.radius));
}

export function getCenterOfMass(geofences) {
  if (!geofences || geofences.length === 0) return null;
  let totalLat = 0;
  let totalLng = 0;
  let totalWeight = 0; 

  geofences.forEach(gf => {
    const weight = gf.radius * gf.radius; 
    totalLat += gf.center.lat * weight;
    totalLng += gf.center.lng * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) return geofences[0].center;

  return {
    lat: totalLat / totalWeight,
    lng: totalLng / totalWeight,
  };
}

export function getMaxRadiusFromCenter(centerOfMass, geofences) {
  if (!centerOfMass || !geofences || geofences.length === 0) return 0;
  let maxDist = 0;
  geofences.forEach(gf => {
    const distToEdge = calculateDistance(centerOfMass.lat, centerOfMass.lng, gf.center.lat, gf.center.lng) + parseFloat(gf.radius);
    if (distToEdge > maxDist) {
      maxDist = distToEdge;
    }
  });
  return maxDist;
}
