import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import api from '../../utils/api';
import { toast } from '../../hooks/use-toast';
import { X, Clock, CheckCircle, XCircle } from 'lucide-react';

const OrderBook = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (error) {
      // Error handled by UI state
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`);
      toast({
        title: "Success",
        description: "Order has been cancelled successfully",
      });
      fetchOrders(); // Refresh orders
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      executed: 'default',
      cancelled: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getOrderTypeBadge = (type) => {
    return (
      <Badge variant={type === 'buy' ? 'default' : 'outline'}>
        {type === 'buy' ? 'BUY' : 'SELL'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Order Book
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.order_status)}
                    <span className="font-semibold">{order.product_name}</span>
                    <span className="text-sm text-gray-500">({order.symbol})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getOrderTypeBadge(order.order_type)}
                    {getStatusBadge(order.order_status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <div className="font-semibold">{order.quantity}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <div className="font-semibold">₹{order.price}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <div className="font-semibold">
                      ₹{(order.quantity * order.price).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <div className="font-semibold">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {order.order_status === 'pending' && (
                  <div className="mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel Order
                    </Button>
                  </div>
                )}

                {order.execution_date && (
                  <div className="mt-2 text-sm text-gray-500">
                    Executed: {new Date(order.execution_date).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderBook;
