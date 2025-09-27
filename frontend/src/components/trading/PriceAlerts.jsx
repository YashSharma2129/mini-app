import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import api from '../../utils/api';
import { toast } from 'sonner';
import { Plus, Bell, Trash2, Edit } from 'lucide-react';

const alertSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  alert_type: z.string().min(1, 'Alert type is required'),
  target_value: z
    .number({ invalid_type_error: 'Target value must be a number' })
    .positive('Target value must be positive')
    .min(0.01, 'Minimum target value is 0.01')
});

const PriceAlerts = ({ products }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      product_id: '',
      alert_type: 'price_above',
      target_value: ''
    }
  });

  const selectedProduct = watch('product_id');
  const alertType = watch('alert_type');
  const targetValue = watch('target_value');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data.data);
    } catch (error) {
      // Error handled by UI state
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const alertData = {
        product_id: data.product_id,
        alert_type: data.alert_type,
        target_value: parseFloat(data.target_value)
      };

      await api.post('/alerts', alertData);
      
      toast.success("Price alert has been created successfully");

      fetchAlerts();
      setIsDialogOpen(false);
      reset();

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create alert");
    }
  };

  const handleClose = () => {
    reset();
    setIsDialogOpen(false);
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      
      toast.success("Price alert has been deleted successfully");

      fetchAlerts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete alert");
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'price_above':
        return 'Price Above';
      case 'price_below':
        return 'Price Below';
      case 'volume_above':
        return 'Volume Above';
      default:
        return type;
    }
  };

  const getAlertStatusBadge = (isActive, triggeredAt) => {
    if (triggeredAt) {
      return <Badge variant="destructive">Triggered</Badge>;
    }
    return isActive ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Alerts</CardTitle>
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
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Price Alerts</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
                <DialogDescription>
                  Set up a price alert to get notified when a product reaches your target price
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select value={selectedProduct} onValueChange={(value) => setValue('product_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} ({product.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.product_id && (
                    <p className="text-sm text-red-600">{errors.product_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Type</Label>
                  <Select value={alertType} onValueChange={(value) => setValue('alert_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_above">Price Above</SelectItem>
                      <SelectItem value="price_below">Price Below</SelectItem>
                      <SelectItem value="volume_above">Volume Above</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.alert_type && (
                    <p className="text-sm text-red-600">{errors.alert_type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value</Label>
                  <Input
                    id="targetValue"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter target value"
                    {...register('target_value', { valueAsNumber: true })}
                  />
                  {errors.target_value && (
                    <p className="text-sm text-red-600">{errors.target_value.message}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Create Alert
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No price alerts created yet</p>
            <p className="text-sm">Create your first alert to get notified about price changes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{alert.product_name}</span>
                    <span className="text-sm text-gray-500">({alert.symbol})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getAlertStatusBadge(alert.is_active, alert.triggered_at)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <div className="font-semibold">{getAlertTypeLabel(alert.alert_type)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Target:</span>
                    <div className="font-semibold">₹{alert.target_value}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Current:</span>
                    <div className="font-semibold">₹{alert.current_price}</div>
                  </div>
                </div>

                {alert.triggered_at && (
                  <div className="mt-2 text-sm text-red-600">
                    Triggered: {new Date(alert.triggered_at).toLocaleString()}
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

export default PriceAlerts;
