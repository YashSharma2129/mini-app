import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import usePWA from '../hooks/usePWA';

const PWAInstallPrompt = () => {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Check if user has previously dismissed
  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Install TradingApp
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Install TradingApp for a better experience with offline access and faster loading.
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Smartphone className="h-3 w-3" />
              <span>Mobile App</span>
            </div>
            <div className="flex items-center space-x-1">
              <Monitor className="h-3 w-3" />
              <span>Desktop App</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="px-4"
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
