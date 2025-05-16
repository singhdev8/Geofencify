
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioTower, PlusCircle, Trash2, ShieldAlert } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const GeofenceControls = ({
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
  maxRadius = 500,
}) => {
  return (
    <motion.div variants={itemVariants} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" type="number" placeholder="e.g., 20.5937" value={manualLat} onChange={(e) => setManualLat(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" type="number" placeholder="e.g., 78.9629" value={manualLng} onChange={(e) => setManualLng(e.target.value)} />
        </div>
      </div>
      
      <div>
        <Label htmlFor="radius" className="flex items-center">
          <RadioTower className="mr-2 h-5 w-5 text-teal-400" /> Radius: {currentGeofenceRadius} meters (Max: {maxRadius}m)
        </Label>
        <Slider
          id="radius"
          min={50}
          max={maxRadius}
          step={10}
          value={[currentGeofenceRadius]}
          onValueChange={(value) => setCurrentGeofenceRadius(value[0])}
          className="mt-2"
        />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <Switch
          id="restrict-current-geofence"
          checked={isCurrentGeofenceRestricted}
          onCheckedChange={setIsCurrentGeofenceRestricted}
          aria-label="Mark this geofence as restricted"
        />
        <Label htmlFor="restrict-current-geofence" className="text-slate-300 flex items-center">
          <ShieldAlert className={`mr-2 h-5 w-5 ${isCurrentGeofenceRestricted ? 'text-amber-400' : 'text-slate-500'}`} />
          Mark as Restricted Zone (Mic/Camera Off Reminder)
        </Label>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={handleAddGeofence} className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Geofence Zone
        </Button>
        <Button onClick={handleClearAllGeofences} variant="destructive" className="w-full sm:flex-1">
         <Trash2 className="mr-2 h-4 w-4" /> Clear All Zones
        </Button>
      </div>
    </motion.div>
  );
};

export default GeofenceControls;
