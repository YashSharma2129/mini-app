import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import useWebSocket from '../hooks/useWebSocket';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    reconnectAttempts
  } = useWebSocket(
    import.meta.env.VITE_WS_URL || 'http://localhost:5001',
    {
      onOpen: () => {
        if (import.meta.env.DEV) {
          console.log('Socket.IO connection established');
        }
      },
      onClose: (event) => {
        if (import.meta.env.DEV) {
          console.log('Socket.IO connection closed:', event.reason);
        }
      },
      onError: (error) => {
        console.error('Socket.IO error:', error);
      },
      onMessage: (data) => {
        // Handle global Socket.IO messages
        if (import.meta.env.DEV) {
          console.log('Socket.IO message received:', data);
        }
      }
    }
  );

  const value = {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    reconnectAttempts
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
