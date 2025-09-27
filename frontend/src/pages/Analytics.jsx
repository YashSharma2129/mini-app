import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import api from '../utils/api';
import { toast } from '../hooks/use-toast';
import PortfolioAnalytics from '../components/analytics/PortfolioAnalytics';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const Analytics = () => {
  const [marketAnalytics, setMarketAnalytics] = useState(null);
  const [tradingAnalytics, setTradingAnalytics] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      const [marketResponse, tradingResponse, riskResponse] = await Promise.all([
        api.get('/analytics/market'),
        api.get('/analytics/trading'),
        api.get('/analytics/risk')
      ]);

      setMarketAnalytics(marketResponse.data.data);
      setTradingAnalytics(tradingResponse.data.data);
      setRiskAnalysis(riskResponse.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive analytics and insights for your trading portfolio</p>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <PortfolioAnalytics />
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {marketAnalytics && (
            <>
              {/* Market Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{marketAnalytics.marketStats.total_products}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(marketAnalytics.marketStats.avg_price)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Market Cap</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(marketAnalytics.marketStats.total_market_cap)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Volume</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(marketAnalytics.marketStats.avg_volume)}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketAnalytics.topPerformers.map((product, index) => {
                      const ReturnIcon = getReturnIcon(product.price_change);
                      return (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                            <div>
                              <div className="font-semibold">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.symbol} • {product.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(product.current_price)}</div>
                            <div className={`flex items-center space-x-1 ${getReturnColor(product.price_change_percentage)}`}>
                              <ReturnIcon className="h-4 w-4" />
                              <span>{formatPercentage(product.price_change_percentage)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={marketAnalytics.categoryPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="total_market_cap" fill="#8884d8" name="Market Cap" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          {tradingAnalytics && (
            <>
              {/* Trading Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">{tradingAnalytics.summary.total_transactions}</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Buy Amount</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(tradingAnalytics.summary.total_buy_amount)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sell Amount</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(tradingAnalytics.summary.total_sell_amount)}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Price</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(tradingAnalytics.summary.avg_transaction_price)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trading Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={tradingAnalytics.monthlyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="buy_amount" fill="#10B981" name="Buy Amount" />
                      <Bar dataKey="sell_amount" fill="#EF4444" name="Sell Amount" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Traded Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Traded Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tradingAnalytics.topTradedProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.symbol} • {product.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{product.transaction_count} transactions</div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(product.total_amount)} total
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          {riskAnalysis && (
            <>
              {/* Risk Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">HHI Index</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {riskAnalysis.concentration.hhi.toFixed(0)}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top Holding %</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {riskAnalysis.concentration.topHoldingPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <PieChart className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top 5 Holdings %</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {riskAnalysis.concentration.top5HoldingsPercentage.toFixed(1)}%
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Diversification</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {riskAnalysis.diversification.categoryDiversification}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">Portfolio Concentration</div>
                        <div className="text-sm text-gray-500">Risk level based on HHI index</div>
                      </div>
                      <Badge variant={
                        riskAnalysis.concentration.hhi > 2500 ? 'destructive' :
                        riskAnalysis.concentration.hhi > 1500 ? 'secondary' : 'default'
                      }>
                        {riskAnalysis.concentration.hhi > 2500 ? 'High Risk' :
                         riskAnalysis.concentration.hhi > 1500 ? 'Medium Risk' : 'Low Risk'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">Diversification</div>
                        <div className="text-sm text-gray-500">Number of different categories</div>
                      </div>
                      <Badge variant={
                        riskAnalysis.diversification.categoryDiversification < 2 ? 'destructive' :
                        riskAnalysis.diversification.categoryDiversification < 4 ? 'secondary' : 'default'
                      }>
                        {riskAnalysis.diversification.categoryDiversification < 2 ? 'Poor' :
                         riskAnalysis.diversification.categoryDiversification < 4 ? 'Fair' : 'Good'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-semibold">Top Holding Risk</div>
                        <div className="text-sm text-gray-500">Percentage of largest holding</div>
                      </div>
                      <Badge variant={
                        riskAnalysis.concentration.topHoldingPercentage > 30 ? 'destructive' :
                        riskAnalysis.concentration.topHoldingPercentage > 20 ? 'secondary' : 'default'
                      }>
                        {riskAnalysis.concentration.topHoldingPercentage > 30 ? 'High Risk' :
                         riskAnalysis.concentration.topHoldingPercentage > 20 ? 'Medium Risk' : 'Low Risk'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
