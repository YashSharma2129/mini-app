import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const [summaryResponse, portfolioResponse] = await Promise.all([
        portfolioAPI.getPortfolioSummary(),
        portfolioAPI.getPortfolio()
      ]);

      setPortfolioSummary(summaryResponse.data.data);
      setPortfolio(portfolioResponse.data.data.portfolio);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">Wallet Balance</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(user?.wallet_balance || 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-green-50 via-green-100 to-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">Total Invested</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(portfolioSummary?.total_invested || 0)}
                  </p>
                </div>
                <div className="p-3 bg-green-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 mb-1">Current Value</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(portfolioSummary?.current_value || 0)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">Total Returns</p>
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

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Performance Chart */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900">Portfolio Performance</h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={portfolioChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Portfolio Value']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Allocation */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <h3 className="text-lg font-semibold text-green-900">Portfolio Allocation</h3>
            </CardHeader>
            <CardContent className="p-6">
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
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Invested']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Portfolio Holdings */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Holdings</h3>
          </CardHeader>
          <CardContent className="p-0">
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Holdings Yet</h4>
                <p className="text-gray-600 mb-4">Start building your investment portfolio today!</p>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Units
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Avg Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Invested
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Returns
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {portfolio.map((holding, index) => {
                      const currentValue = holding.total_units * holding.current_price;
                      const holdingReturns = calculateReturns(currentValue, holding.total_invested);
                      
                      return (
                        <tr key={holding.product_id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 font-semibold text-sm">
                                  {holding.product_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {holding.product_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {holding.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatNumber(holding.total_units)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(holding.total_invested / holding.total_units)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(holding.current_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(holding.total_invested)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(currentValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-semibold ${getReturnsColor(holdingReturns.amount)}`}>
                                {formatCurrency(holdingReturns.amount)}
                              </span>
                              <Badge 
                                variant={holdingReturns.amount >= 0 ? 'default' : 'destructive'}
                                className={`ml-2 ${holdingReturns.amount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                              >
                                {holdingReturns.percentage >= 0 ? '+' : ''}{holdingReturns.percentage.toFixed(2)}%
                              </Badge>
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
      </div>
    </div>
  );
};

export default Dashboard;
