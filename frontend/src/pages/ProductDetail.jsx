import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI, portfolioAPI } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/auth';
import { 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Star,
  Share2,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BuyProductModal from '../components/products/BuyProductModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from '../hooks/use-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWatched, setIsWatched] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProductById(id);
      setProduct(response.data.data.product);
      setIsWatched(response.data.data.product.is_watched || false);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add to watchlist",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isWatched) {
        await portfolioAPI.removeFromWatchlist(product.id);
        setIsWatched(false);
        toast({
          title: "Success",
          description: "Product removed from watchlist",
        });
      } else {
        await portfolioAPI.addToWatchlist(product.id);
        setIsWatched(true);
        toast({
          title: "Success",
          description: "Product added to watchlist",
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update watchlist';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleBuySuccess = () => {
    // Refresh product data or navigate to portfolio
    navigate('/portfolio');
  };

  // Mock chart data
  const chartData = [
    { name: '1M', value: product?.price * 0.95 },
    { name: '2M', value: product?.price * 0.98 },
    { name: '3M', value: product?.price * 1.02 },
    { name: '4M', value: product?.price * 0.99 },
    { name: '5M', value: product?.price * 1.05 },
    { name: '6M', value: product?.price * 1.08 },
    { name: 'Now', value: product?.price }
  ];

  const getPriceChange = () => {
    // Mock price change
    const change = (Math.random() - 0.5) * 10;
    return {
      amount: change,
      percentage: (change / product.price) * 100,
      isPositive: change >= 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const priceChange = getPriceChange();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Product Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant={product.category === 'Stocks' ? 'primary' : 'success'}>
                        {product.category}
                      </Badge>
                      {product.pe_ratio && (
                        <Badge variant="secondary">
                          P/E: {product.pe_ratio}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h1>
                    {product.description && (
                      <p className="text-gray-600 mb-4">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWatchlistToggle}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${
                        isWatched ? 'text-red-500 fill-current' : ''
                      }`} />
                      {isWatched ? 'Watched' : 'Watch'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Price Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        {formatCurrency(product.price)}
                      </div>
                      <div className={`flex items-center space-x-2 ${
                        priceChange.isPositive ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {priceChange.isPositive ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                        <span className="text-lg font-semibold">
                          {priceChange.isPositive ? '+' : ''}{priceChange.percentage.toFixed(2)}%
                        </span>
                        <span className="text-sm">
                          ({priceChange.isPositive ? '+' : ''}{formatCurrency(priceChange.amount)})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">4.2</span>
                        <span className="text-sm text-gray-500">(1,234 reviews)</span>
                      </div>
                      <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Price Chart */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <h3 className="text-lg font-semibold text-green-900">Price History (6 Months)</h3>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Price']}
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

            {/* Enhanced Product Details */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900">Product Details</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Price:</span>
                      <span className="font-medium">{formatCurrency(product.price)}</span>
                    </div>
                    {product.pe_ratio && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">P/E Ratio:</span>
                        <span className="font-medium">{product.pe_ratio}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {product.market_cap && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Market Cap:</span>
                        <span className="font-medium">₹{formatNumber(product.market_cap / 10000000)}Cr</span>
                      </div>
                    )}
                    {product.volume && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-medium">{formatNumber(product.volume)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Listed:</span>
                      <span className="font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Buy Section */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Buy {product.name}</h3>
                
                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Available Balance</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(user?.wallet_balance || 0)}
                      </p>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                      onClick={() => setShowBuyModal(true)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Buy Now
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Minimum investment: {formatCurrency(product.price * 0.01)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Please login to buy this product
                    </p>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate('/login')}
                    >
                      Login to Buy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900">Quick Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">52W High:</span>
                    <span className="font-medium">{formatCurrency(product.price * 1.15)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">52W Low:</span>
                    <span className="font-medium">{formatCurrency(product.price * 0.85)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Volume:</span>
                    <span className="font-medium">{formatNumber(product.volume || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Cap:</span>
                    <span className="font-medium">₹{formatNumber((product.market_cap || 0) / 10000000)}Cr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Risk Disclaimer */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-warning-600">Risk Disclaimer</h3>
                <p className="text-sm text-gray-600">
                  Investments in securities are subject to market risks. Please read all scheme related 
                  documents carefully before investing. Past performance is not indicative of future results.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buy Modal */}
        <BuyProductModal
          product={product}
          user={user}
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          onSuccess={handleBuySuccess}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
