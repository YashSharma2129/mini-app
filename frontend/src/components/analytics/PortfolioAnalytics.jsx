import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { analyticsAPI } from '../../utils/api';
import { toast } from '../../hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Target,
  AlertTriangle
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

const PortfolioAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getPortfolioAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch portfolio analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Convert to number and handle all edge cases
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatPercentage = (value) => {
    // Convert to number and handle all edge cases
    const numValue = Number(value);
    if (isNaN(numValue) || numValue === null || numValue === undefined) {
      return '0.00%';
    }
    return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`;
  };

  const getReturnColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getReturnIcon = (value) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p>No analytics data available</p>
      </div>
    );
  }

  const { portfolio, allocation, transactionHistory } = analytics;

  // Prepare data for charts
  const allocationData = Object.entries(allocation).map(([category, data]) => ({
    name: category,
    value: data.percentage,
    amount: data.current
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(portfolio.totalInvested)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(portfolio.totalCurrentValue)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unrealized P&L</p>
                <p className={`text-2xl font-bold ${getReturnColor(portfolio.totalUnrealizedPnL)}`}>
                  {formatCurrency(portfolio.totalUnrealizedPnL)}
                </p>
              </div>
              {React.createElement(getReturnIcon(portfolio.totalUnrealizedPnL), {
                className: `h-8 w-8 ${getReturnColor(portfolio.totalUnrealizedPnL)}`
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${getReturnColor(portfolio.totalReturnPercentage)}`}>
                  {formatPercentage(portfolio.totalReturnPercentage)}
                </p>
              </div>
              {React.createElement(getReturnIcon(portfolio.totalReturnPercentage), {
                className: `h-8 w-8 ${getReturnColor(portfolio.totalReturnPercentage)}`
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Portfolio Allocation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value || 0).toFixed(1)}%`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Transaction History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="buy_amount" fill="#10B981" name="Buy Amount" />
                <Bar dataKey="sell_amount" fill="#EF4444" name="Sell Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-right py-3 px-4">Quantity</th>
                  <th className="text-right py-3 px-4">Avg Price</th>
                  <th className="text-right py-3 px-4">Current Price</th>
                  <th className="text-right py-3 px-4">Invested</th>
                  <th className="text-right py-3 px-4">Current Value</th>
                  <th className="text-right py-3 px-4">P&L</th>
                  <th className="text-right py-3 px-4">Return %</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => {
                  const ReturnIcon = getReturnIcon(holding.unrealized_pnl);
                  return (
                    <tr key={holding.product_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold">{holding.product_name}</div>
                          <div className="text-sm text-muted-foreground">{holding.symbol}</div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{holding.quantity}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(holding.average_price)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(holding.current_price)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(holding.invested_amount)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(holding.current_value)}</td>
                      <td className={`text-right py-3 px-4 ${getReturnColor(holding.unrealized_pnl)}`}>
                        <div className="flex items-center justify-end space-x-1">
                          <ReturnIcon className="h-4 w-4" />
                          <span>{formatCurrency(holding.unrealized_pnl)}</span>
                        </div>
                      </td>
                      <td className={`text-right py-3 px-4 ${getReturnColor(holding.return_percentage)}`}>
                        {formatPercentage(holding.return_percentage)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioAnalytics;
