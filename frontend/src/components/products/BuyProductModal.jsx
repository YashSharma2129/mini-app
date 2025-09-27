import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { transactionsAPI } from '../../utils/api';
import { formatCurrency, formatNumber } from '../../utils/auth';
import { X, ShoppingCart, Calculator, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/card';
import { toast } from '../../hooks/use-toast';

const createSchema = (walletBalance, pricePerUnit) => z.object({
  units: z
    .number({ invalid_type_error: 'Units must be a number' })
    .positive('Units must be positive')
    .min(0.01, 'Minimum units is 0.01')
    .refine((value) => {
      const totalAmount = value * pricePerUnit;
      return totalAmount <= walletBalance;
    }, 'Insufficient wallet balance')
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
    resolver: zodResolver(createSchema(user?.wallet_balance || 0, product?.price || 0)),
    defaultValues: {
      units: 1
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
      <div className="bg-card rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Buy Product</h2>
                <p className="text-sm text-muted-foreground">{product?.name}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Product Info */}
          <Card className="mb-6">
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(product?.price || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-semibold text-foreground">{product?.category}</span>
                </div>
                {product?.pe_ratio && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">P/E Ratio:</span>
                    <span className="font-semibold text-foreground">{product.pe_ratio}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Balance */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Available Balance</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">
              {formatCurrency(user?.wallet_balance || 0)}
            </p>
          </div>

          {/* Purchase Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
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
                <p className="text-sm text-destructive mt-1">{errors.units.message}</p>
              )}
            </div>

            {/* Calculation Summary */}
            <Card>
              <CardContent>
                <h3 className="font-semibold text-foreground mb-4">Purchase Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units:</span>
                    <span className="font-medium text-foreground">{formatNumber(units)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per unit:</span>
                    <span className="font-medium text-foreground">{formatCurrency(product?.price || 0)}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-foreground font-semibold">Total Amount:</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Balance:</span>
                    <span className={`font-medium ${
                      remainingBalance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning for insufficient balance */}
            {remainingBalance < 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Insufficient Balance
                  </span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
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
