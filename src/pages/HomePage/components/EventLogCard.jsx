
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import EventLog from '../EventLog';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const EventLogCard = ({ eventLog, activeZoneIds, definedGeofences }) => {
  return (
    <Card as={motion.div} variants={itemVariants}>
      <CardHeader>
        <CardTitle className="flex items-center"><ListChecks className="mr-2 h-7 w-7 text-sky-400" /> Geofence Movement Log</CardTitle>
        <CardDescription>Timeline of entries and exits from defined geofence zones/groups.</CardDescription>
      </CardHeader>
      <CardContent>
        <EventLog eventLog={eventLog} activeZoneIds={activeZoneIds} definedGeofences={definedGeofences} />
      </CardContent>
    </Card>
  );
};

export default EventLogCard;
