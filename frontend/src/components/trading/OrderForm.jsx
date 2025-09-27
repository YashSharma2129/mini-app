import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from '../../hooks/use-toast';
import api from '../../utils/api';

const schema = yup.object({
  orderType: yup.string().required('Order type is required'),
  quantity: yup
    .number()
    .positive('Quantity must be positive')
    .min(0.01, 'Minimum quantity is 0.01')
    .required('Quantity is required'),
  orderPrice: yup
    .number()
    .positive('Price must be positive')
    .min(0.01, 'Minimum price is 0.01')
    .nullable()
    .optional()
});

const OrderForm = ({ product, onOrderSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      orderType: 'buy',
      quantity: '',
      orderPrice: ''
    }
  });

  const orderType = watch('orderType');
  const quantity = watch('quantity');
  const orderPrice = watch('orderPrice');

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const orderData = {
        product_id: product.id,
        order_type: data.orderType,
        quantity: parseFloat(data.quantity),
        order_price: data.orderPrice ? parseFloat(data.orderPrice) : null
      };

      const response = await api.post('/orders', orderData);

      toast({
        title: "Success",
        description: `${data.orderType === 'buy' ? 'Buy' : 'Sell'} order for ${data.quantity} units created successfully`,
      });

      onOrderSuccess && onOrderSuccess(response.data.data);
      onClose && onClose();
      reset();

    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!quantity || !product) return 0;
    const price = orderPrice || product.price;
    return parseFloat(quantity) * price;
  };

  const handleClose = () => {
    reset();
    onClose && onClose();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {orderType === 'buy' ? 'Buy' : 'Sell'} {product?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Order Type */}
          <div className="space-y-2">
            <Label htmlFor="orderType">Order Type</Label>
            <Select value={orderType} onValueChange={(value) => setValue('orderType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select order type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
            {errors.orderType && (
              <p className="text-sm text-destructive">{errors.orderType.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter quantity"
              {...register('quantity')}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          {/* Order Price (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="orderPrice">Order Price (Optional)</Label>
            <Input
              id="orderPrice"
              type="number"
              step="0.01"
              min="0.01"
              placeholder={`Current: ₹${product?.price || 0}`}
              {...register('orderPrice')}
            />
            {errors.orderPrice && (
              <p className="text-sm text-destructive">{errors.orderPrice.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Leave empty for market order at current price
            </p>
          </div>

          {/* Current Price Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Current Price:</span>
              <span className="font-semibold">₹{product?.price || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Order Price:</span>
              <span className="font-semibold">
                ₹{orderPrice || product?.price || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
              <span>Total Amount:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : `Create ${orderType === 'buy' ? 'Buy' : 'Sell'} Order`}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
