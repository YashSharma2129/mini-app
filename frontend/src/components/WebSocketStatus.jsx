import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useWebSocketContext } from '../context/WebSocketContext';
import { Badge } from './ui/badge';

const WebSocketStatus = () => {
  const { isConnected, reconnectAttempts } = useWebSocketContext();

  if (isConnected) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        <Wifi className="h-3 w-3 mr-1" />
        Connected
      </Badge>
    );
  }

  if (reconnectAttempts > 0) {
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Reconnecting... ({reconnectAttempts})
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
      <WifiOff className="h-3 w-3 mr-1" />
      Disconnected
    </Badge>
  );
};

export default WebSocketStatus;
