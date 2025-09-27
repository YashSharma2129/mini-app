import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import api from '../../utils/api';
import { toast } from '../../hooks/use-toast';
import useNotifications from '../../hooks/useNotifications';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertCircle,
  Info,
  CheckCircle,
  TrendingUp,
  Settings,
  TestTube,
  MoreHorizontal
} from 'lucide-react';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isPermissionGranted,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
    createTestNotification,
    requestNotificationPermission
  } = useNotifications();

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
    toast({
      title: "Success",
      description: "Notification marked as read",
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "Success",
      description: "All notifications have been marked as read",
    });
  };

  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId);
    toast({
      title: "Success",
      description: "Notification has been deleted",
    });
  };

  const handleClearAll = () => {
    clearNotifications();
    toast({
      title: "Success",
      description: "All notifications have been cleared",
    });
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast({
        title: "Success",
        description: "Notification permission granted",
      });
    } else {
      toast({
        title: "Permission Denied",
        description: "Notification permission was denied",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
      case 'order_executed':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'alert':
      case 'price_alert':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'system':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      case 'transaction':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'portfolio_update':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'market_news':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
      case 'order_executed':
        return 'border-blue-200 bg-blue-50';
      case 'alert':
      case 'price_alert':
        return 'border-yellow-200 bg-yellow-50';
      case 'system':
        return 'border-border bg-muted/50';
      case 'transaction':
        return 'border-green-200 bg-green-50';
      case 'portfolio_update':
        return 'border-green-200 bg-green-50';
      case 'market_news':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-border bg-muted/50';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
              {!isConnected && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Offline
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {!isPermissionGranted && (
                    <DropdownMenuItem onClick={handleRequestPermission}>
                      <Settings className="h-4 w-4 mr-2" />
                      Enable Notifications
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => createTestNotification('price_alert')}>
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Alert
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogTitle>
          <DialogDescription>
            View and manage your notifications
            {!isPermissionGranted && (
              <span className="block text-orange-600 mt-1">
                Enable browser notifications for real-time alerts
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
