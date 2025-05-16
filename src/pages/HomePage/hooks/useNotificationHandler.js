
import React from 'react';
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function useNotificationHandler() {
  const { toast } = useToast();

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast({ title: "Notifications not supported", description: "This browser does not support desktop notification.", variant: "destructive" });
      return false;
    } else if (Notification.permission === "granted") {
      return true;
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        return true;
      }
    }
    toast({ title: "Notification Permission Denied", description: "Please enable notifications in your browser settings.", variant: "destructive" });
    return false;
  }, [toast]);

  const showNotification = useCallback((title, body, variant) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: '/vite.svg' });
    }
    toast({ title, description: body, duration: 5000, variant: variant || "default" });
  }, [toast]);

  return { requestNotificationPermission, showNotification };
}
