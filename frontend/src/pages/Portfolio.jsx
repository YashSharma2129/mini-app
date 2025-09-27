import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI } from '../utils/api';
import { formatCurrency, formatNumber, calculateReturns, getReturnsColor } from '../utils/auth';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Portfolio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('holdings');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [summaryResponse, portfolioResponse, watchlistResponse] = await Promise.all([
        portfolioAPI.getPortfolioSummary(),
        portfolioAPI.getPortfolio(),
        portfolioAPI.getWatchlist()
      ]);

      setPortfolioSummary(summaryResponse.data.data);
      setPortfolio(portfolioResponse.data.data.portfolio);
      setWatchlist(watchlistResponse.data.data.watchlist);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data
  const portfolioChartData = [
    { name: 'Jan', value: 85000 },
    { name: 'Feb', value: 92000 },
    { name: 'Mar', value: 88000 },
    { name: 'Apr', value: 105000 },
    { name: 'May', value: 98000 },
    { name: 'Jun', value: 112000 }
  ];

  const pieChartData = portfolio.map(item => ({
    name: item.product_name,
    value: item.total_invested,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const returns = calculateReturns(
    portfolioSummary?.current_value || 0,
    portfolioSummary?.total_invested || 0
  );

  const tabs = [
    { id: 'holdings', label: 'Holdings', count: portfolio.length },
    { id: 'watchlist', label: 'Watchlist', count: watchlist.length },
    { id: 'performance', label: 'Performance', count: null }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground">Manage your investments and watchlist</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-blue-700/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Wallet Balance</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(user?.wallet_balance || 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900/20 dark:via-green-800/20 dark:to-green-700/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Invested</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(portfolioSummary?.total_invested || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:via-yellow-800/20 dark:to-yellow-700/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Current Value</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {formatCurrency(portfolioSummary?.current_value || 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 dark:from-purple-900/20 dark:via-purple-800/20 dark:to-purple-700/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Total Returns</p>
                  <p className={`text-2xl font-bold ${getReturnsColor(returns.amount)}`}>
                    {formatCurrency(returns.amount)}
                  </p>
                  <p className={`text-sm font-medium ${getReturnsColor(returns.percentage)}`}>
                    {returns.percentage >= 0 ? '+' : ''}{returns.percentage.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300 ${returns.amount >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  {returns.amount >= 0 ? (
                    <ArrowUpRight className="h-6 w-6 text-white" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`py-0.5 px-2 rounded-full text-xs font-semibold ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-accent text-muted-foreground'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 opacity-10 animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'holdings' && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900">Your Holdings</h3>
                <Link to="/products">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Investment
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {portfolio.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No holdings yet</h3>
                  <p className="text-muted-foreground mb-4">Start building your portfolio by investing in products</p>
                  <Link to="/products">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Units
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Avg Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Current Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Invested
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Returns
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {portfolio.map((holding) => {
                        const currentValue = holding.total_units * holding.current_price;
                        const holdingReturns = calculateReturns(currentValue, holding.total_invested);
                        
                        return (
                          <tr key={holding.product_id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {holding.product_name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {holding.category}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatNumber(holding.total_units)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatCurrency(holding.total_invested / holding.total_units)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatCurrency(holding.current_price)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatCurrency(holding.total_invested)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                              {formatCurrency(currentValue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${getReturnsColor(holdingReturns.amount)}`}>
                                  {formatCurrency(holdingReturns.amount)}
                                </span>
                                <Badge 
                                  variant={holdingReturns.amount >= 0 ? 'success' : 'danger'}
                                  className="ml-2"
                                >
                                  {holdingReturns.percentage >= 0 ? '+' : ''}{holdingReturns.percentage.toFixed(2)}%
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Link to={`/products/${holding.product_id}`}>
                                  <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/trading?product=${holding.product_id}&action=sell`)}
                                  className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300"
                                >
                                  Sell
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'watchlist' && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 border-b border-pink-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pink-900">Watchlist</h3>
                <Link to="/products">
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Watchlist
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {watchlist.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No items in watchlist</h3>
                  <p className="text-muted-foreground mb-4">Add products to your watchlist to track their performance</p>
                  <Link to="/products">
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {watchlist.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardContent>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <Badge variant={item.category === 'Stocks' ? 'primary' : 'success'}>
                              {item.category}
                            </Badge>
                            <h3 className="text-lg font-semibold text-foreground mt-2">
                              {item.name}
                            </h3>
                            <p className="text-2xl font-bold text-primary-600 mt-2">
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Heart className="h-5 w-5 text-red-500 fill-current" />
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <Link to={`/products/${item.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-all duration-300"
                            onClick={() => navigate(`/products/${item.id}`)}
                          >
                            Buy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portfolio Performance Chart */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <h3 className="text-lg font-semibold text-green-900">Portfolio Performance</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Portfolio Value']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Allocation */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900">Portfolio Allocation</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Invested']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
