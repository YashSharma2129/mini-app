import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocketContext } from '../context/WebSocketContext';
import { toast } from 'sonner';
import usePWA from './usePWA';

const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const { isConnected, lastMessage } = useWebSocketContext();
  const { showNotification, requestNotificationPermission } = usePWA();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if (isAuthenticated) {
      requestNotificationPermission().then(granted => {
        setIsPermissionGranted(granted);
      });
    }
  }, [isAuthenticated, requestNotificationPermission]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage && isAuthenticated) {
      handleNewNotification(lastMessage);
    }
  }, [lastMessage, isAuthenticated]);

  const handleNewNotification = useCallback((message) => {
    const notification = {
      id: Date.now() + Math.random(),
      type: message.type || 'info',
      title: message.title || 'Notification',
      message: message.message || message.description || '',
      timestamp: new Date().toISOString(),
      read: false,
      data: message.data || {}
    };

    // Add to notifications list
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast(notification.message, {
      description: notification.title
    });

    // Show browser notification if permission granted
    if (isPermissionGranted) {
      showNotification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: notification.id,
        data: notification.data
      });
    }
  }, [isPermissionGranted, showNotification]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Simulate different types of notifications for demo
  const createTestNotification = useCallback((type) => {
    const testNotifications = {
      price_alert: {
        type: 'price_alert',
        title: 'Price Alert Triggered',
        message: 'Reliance Industries has reached your target price of ₹2,500',
        data: { product_name: 'Reliance Industries', target_price: 2500 }
      },
      order_executed: {
        type: 'order_executed',
        title: 'Order Executed',
        message: 'Your buy order for 10 units of TCS has been executed',
        data: { product_name: 'TCS', units: 10, order_type: 'buy' }
      },
      portfolio_update: {
        type: 'portfolio_update',
        title: 'Portfolio Update',
        message: 'Your portfolio value has increased by 5.2% today',
        data: { change_percentage: 5.2 }
      },
      market_news: {
        type: 'market_news',
        title: 'Market News',
        message: 'Nifty 50 gains 1.5% in today\'s trading session',
        data: { index: 'Nifty 50', change: 1.5 }
      }
    };

    const notification = testNotifications[type];
    if (notification) {
      handleNewNotification(notification);
    }
  }, [handleNewNotification]);

  return {
    notifications,
    unreadCount,
    isPermissionGranted,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
    createTestNotification,
    requestNotificationPermission: () => {
      return requestNotificationPermission().then(granted => {
        setIsPermissionGranted(granted);
        return granted;
      });
    }
  };
};

export default useNotifications;
