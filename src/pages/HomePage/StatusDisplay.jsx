
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BellRing } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const StatusDisplay = ({
  locationLoading,
  locationError,
  currentLocation,
  geofenceStatusComponent,
}) => {
  return (
    <Card as={motion.div} variants={itemVariants}>
      <CardHeader>
        <CardTitle className="flex items-center"><BellRing className="mr-2 h-7 w-7 text-purple-400" /> Current Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {locationLoading && <p className="text-slate-400">Fetching location...</p>}
        {locationError && <p className="text-red-400 flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> Location Error: {locationError}</p>}
        {currentLocation && (
          <div className="text-slate-300">
            <p>Current Location: Lat: {currentLocation.latitude.toFixed(4)}, Lng: {currentLocation.longitude.toFixed(4)}</p>
            <p>Accuracy: {currentLocation.accuracy.toFixed(0)} meters</p>
          </div>
        )}
        {geofenceStatusComponent}
      </CardContent>
    </Card>
  );
};

export default StatusDisplay;
