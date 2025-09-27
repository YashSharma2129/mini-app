import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { transactionsAPI } from '../../utils/api';
import { formatCurrency, formatNumber } from '../../utils/auth';
import { X, ShoppingCart, Calculator, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/card';
import { toast } from '../../hooks/use-toast';

const schema = yup.object({
  units: yup
    .number()
    .positive('Units must be positive')
    .min(0.01, 'Minimum units is 0.01')
    .required('Units is required')
    .test('max-units', 'Insufficient wallet balance', function(value) {
      const { walletBalance, pricePerUnit } = this.parent;
      const totalAmount = value * pricePerUnit;
      return totalAmount <= walletBalance;
    })
});

const BuyProductModal = ({ product, user, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      units: 1,
      walletBalance: user?.wallet_balance || 0,
      pricePerUnit: product?.price || 0
    }
  });

  const units = watch('units') || 1;
  const totalAmount = units * (product?.price || 0);
  const remainingBalance = (user?.wallet_balance || 0) - totalAmount;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await transactionsAPI.buyProduct({
        productId: product.id,
        units: data.units
      });

      toast({
        title: "Success",
        description: "Product purchased successfully!",
      });
      onSuccess?.(response.data.data);
      onClose();
      reset();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to purchase product';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Buy Product</h2>
                <p className="text-sm text-gray-600">{product?.name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Product Info */}
          <Card className="mb-6">
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-semibold">{formatCurrency(product?.price || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold">{product?.category}</span>
                </div>
                {product?.pe_ratio && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/E Ratio:</span>
                    <span className="font-semibold">{product.pe_ratio}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Available Balance</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {formatCurrency(user?.wallet_balance || 0)}
            </p>
          </div>

          {/* Purchase Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Units
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter units to buy"
                {...register('units', { valueAsNumber: true })}
              />
              {errors.units && (
                <p className="text-sm text-red-600 mt-1">{errors.units.message}</p>
              )}
            </div>

            {/* Calculation Summary */}
            <Card>
              <CardContent>
                <h3 className="font-semibold text-gray-900 mb-4">Purchase Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Units:</span>
                    <span className="font-medium">{formatNumber(units)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per unit:</span>
                    <span className="font-medium">{formatCurrency(product?.price || 0)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-semibold">Total Amount:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Balance:</span>
                    <span className={`font-medium ${
                      remainingBalance >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning for insufficient balance */}
            {remainingBalance < 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">
                    Insufficient Balance
                  </span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  You need {formatCurrency(Math.abs(remainingBalance))} more to complete this purchase.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || remainingBalance < 0}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyProductModal;
