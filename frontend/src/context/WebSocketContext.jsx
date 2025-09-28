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
    import.meta.env.VITE_WS_URL || 'https://mini-app-ts9c.onrender.com',
    {
      onOpen: () => {
        if (import.meta.env.DEV) {
          // Connection established
        }
      },
      onClose: (event) => {
        if (import.meta.env.DEV) {
          // Connection closed
        }
      },
      onError: (error) => {
        // WebSocket error - handled by UI state
      },
      onMessage: (data) => {
        // Handle global Socket.IO messages
        if (import.meta.env.DEV) {
          // Message received
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
