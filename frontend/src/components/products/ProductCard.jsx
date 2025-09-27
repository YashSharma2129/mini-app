import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productsAPI, portfolioAPI } from '../../utils/api';
import { formatCurrency, formatNumber } from '../../utils/auth';
import { 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  ShoppingCart,
  Eye,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from '../../hooks/use-toast';

const ProductCard = ({ product, onWatchlistUpdate }) => {
  const { isAuthenticated } = useAuth();
  const [isWatched, setIsWatched] = useState(product.is_watched || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWatchlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to add to watchlist",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
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
      
      if (onWatchlistUpdate) {
        onWatchlistUpdate();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update watchlist';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'stocks':
        return 'primary';
      case 'mutual funds':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getPriceChange = () => {
    // Mock price change for demo
    const change = (Math.random() - 0.5) * 10;
    return {
      amount: change,
      percentage: (change / product.price) * 100,
      isPositive: change >= 0
    };
  };

  const priceChange = getPriceChange();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
      <CardContent className="p-6">
        {/* Header with category and watchlist */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge variant={getCategoryColor(product.category)} className="text-xs">
              {product.category}
            </Badge>
            {product.pe_ratio && (
              <Badge variant="outline" className="text-xs">
                P/E: {product.pe_ratio}
              </Badge>
            )}
          </div>
          <button
            onClick={handleWatchlistToggle}
            disabled={isLoading}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${
                isWatched 
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-400 hover:text-red-500'
              }`} 
            />
          </button>
        </div>

        {/* Product name and description */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price and change */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              priceChange.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {priceChange.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {priceChange.isPositive ? '+' : ''}{priceChange.percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Market data */}
        <div className="space-y-1 mb-4">
          {product.market_cap && (
            <div className="text-sm text-gray-600">
              Market Cap: ₹{formatNumber(product.market_cap / 10000000)}Cr
            </div>
          )}
          {product.volume && (
            <div className="text-sm text-gray-600">
              Volume: {formatNumber(product.volume)}
            </div>
          )}
        </div>

        {/* Rating and actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 font-medium">
              {(4.0 + Math.random()).toFixed(1)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 px-3"
            >
              <Link to={`/products/${product.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Link>
            </Button>
            {isAuthenticated && (
              <Button
                size="sm"
                className="h-8 px-3"
                asChild
              >
                <Link to={`/products/${product.id}`}>
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Buy
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
