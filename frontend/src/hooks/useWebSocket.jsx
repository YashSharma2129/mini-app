import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const useWebSocket = (url, options = {}) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const optionsRef = useRef(options);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    try {
      const token = localStorage.getItem('token');
      const socket = io(url, {
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectInterval,
        timeout: 20000,
      });
      
      socket.on('connect', () => {
        if (import.meta.env.DEV) {
          // Connected to WebSocket
        }
        setIsConnected(true);
        setReconnectAttempts(0);
        setSocket(socket);
        
        if (optionsRef.current.onOpen) {
          optionsRef.current.onOpen();
        }
      });

      socket.on('message', (data) => {
        setLastMessage(data);
        
        if (optionsRef.current.onMessage) {
          optionsRef.current.onMessage(data);
        }

        // Handle different message types
        switch (data.type) {
          case 'notification':
            toast(data.message, {
              description: data.title || 'Notification'
            });
            break;
          case 'price_alert':
            toast(`${data.product_name} has reached ₹${data.target_price}`, {
              description: 'Price Alert'
            });
            break;
          case 'order_update':
            toast(`Your ${data.order_type} order for ${data.product_name} has been ${data.status}`, {
              description: 'Order Update'
            });
            break;
          case 'portfolio_update':
            // Portfolio updates don't need toast notifications
            break;
          default:
            // Unknown message type received
        }
      });

      socket.on('disconnect', (reason) => {
        if (import.meta.env.DEV) {
          // Disconnected from WebSocket
        }
        setIsConnected(false);
        setSocket(null);
        
        if (optionsRef.current.onClose) {
          optionsRef.current.onClose({ reason });
        }
      });

      socket.on('connect_error', (error) => {
        // Connection error - handled by UI state
        setIsConnected(false);
        
        if (optionsRef.current.onError) {
          optionsRef.current.onError(error);
        }
      });

    } catch (error) {
      // Failed to create WebSocket connection
    }
  }, [isAuthenticated, user, url, maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.disconnect();
    }
    
    setIsConnected(false);
    setSocket(null);
  }, [socket]);

  const sendMessage = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else if (import.meta.env.DEV) {
      // WebSocket is not connected
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    reconnectAttempts,
    connect,
    disconnect
  };
};

export default useWebSocket;
