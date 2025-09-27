import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import usePWA from '../hooks/usePWA';

const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <Alert className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 border-orange-200 bg-orange-50">
      <WifiOff className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        You're offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
};

export default OfflineIndicator;
