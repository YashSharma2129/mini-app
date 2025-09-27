import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from './use-toast';

const useWebSocket = (url, options = {}) => {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;
  const reconnectInterval = options.reconnectInterval || 3000;

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    try {
      const ws = new WebSocket(`${url}?token=${localStorage.getItem('token')}`);
      
      ws.onopen = () => {
        if (import.meta.env.DEV) {
          console.log('WebSocket connected');
        }
        setIsConnected(true);
        setReconnectAttempts(0);
        setSocket(ws);
        
        if (options.onOpen) {
          options.onOpen();
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          if (options.onMessage) {
            options.onMessage(data);
          }

          // Handle different message types
          switch (data.type) {
            case 'notification':
              toast({
                title: data.title || 'Notification',
                description: data.message,
                variant: data.variant || 'default',
              });
              break;
            case 'price_alert':
              toast({
                title: 'Price Alert',
                description: `${data.product_name} has reached ₹${data.target_price}`,
                variant: 'default',
              });
              break;
            case 'order_update':
              toast({
                title: 'Order Update',
                description: `Your ${data.order_type} order for ${data.product_name} has been ${data.status}`,
                variant: data.status === 'executed' ? 'default' : 'destructive',
              });
              break;
            case 'portfolio_update':
              // Portfolio updates don't need toast notifications
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        if (import.meta.env.DEV) {
          console.log('WebSocket disconnected:', event.code, event.reason);
        }
        setIsConnected(false);
        setSocket(null);
        
        if (options.onClose) {
          options.onClose(event);
        }

        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = reconnectInterval * Math.pow(2, reconnectAttempts);
          if (import.meta.env.DEV) {
            console.log(`Attempting to reconnect in ${delay}ms...`);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        
        if (options.onError) {
          options.onError(error);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [isAuthenticated, user, url, options, reconnectAttempts, maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close(1000, 'Manual disconnect');
    }
    
    setIsConnected(false);
    setSocket(null);
  }, [socket]);

  const sendMessage = useCallback((message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    } else if (import.meta.env.DEV) {
      console.warn('WebSocket is not connected');
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
  }, [isAuthenticated, user, connect, disconnect]);

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
