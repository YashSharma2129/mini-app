import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import OrderForm from '../components/trading/OrderForm';
import OrderBook from '../components/trading/OrderBook';
import PriceAlerts from '../components/trading/PriceAlerts';
import { productsAPI, ordersAPI } from '../utils/api';
import { toast } from '../hooks/use-toast';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';


const Trading = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [tradingStats, setTradingStats] = useState({
    totalOrders: 0,
    executedOrders: 0,
    pendingOrders: 0,
    totalBuyAmount: 0,
    totalSellAmount: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchTradingStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // Set empty array on error
    }
  };

  const fetchTradingStats = async () => {
    try {
      const response = await ordersAPI.getOrderStats();
      setTradingStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch trading stats:', error);
    }
  };

  const handleOrderSuccess = () => {
    fetchTradingStats();
    setIsOrderDialogOpen(false);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsOrderDialogOpen(true);
  };

  const getTotalTradingVolume = () => {
    return tradingStats.totalBuyAmount + tradingStats.totalSellAmount;
  };

  const getNetPosition = () => {
    return tradingStats.totalSellAmount - tradingStats.totalBuyAmount;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Trading Dashboard</h1>
        <p className="text-muted-foreground">Advanced trading features and order management</p>
      </div>

      {/* Enhanced Trading Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{tradingStats.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-green-50 via-green-100 to-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Executed Orders</p>
                <p className="text-2xl font-bold text-green-900">{tradingStats.executedOrders}</p>
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
                <p className="text-sm font-medium text-yellow-700 mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900">{tradingStats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">Trading Volume</p>
                <p className="text-2xl font-bold text-purple-900">₹{getTotalTradingVolume().toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Order Book</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-border">
              <CardTitle className="text-blue-900 dark:text-blue-100">Available Products</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(products) && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="border-0 shadow-lg bg-card rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
                        <span className="text-sm text-muted-foreground">{product.symbol}</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Price:</span>
                          <span className="font-semibold text-foreground">₹{product.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-semibold text-foreground">{product.category}</span>
                        </div>
                        {product.pe_ratio && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P/E Ratio:</span>
                            <span className="font-semibold text-foreground">{product.pe_ratio}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct({ ...product, orderType: 'buy' });
                            setIsOrderDialogOpen(true);
                          }}
                        >
                          Buy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct({ ...product, orderType: 'sell' });
                            setIsOrderDialogOpen(true);
                          }}
                        >
                          Sell
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No products available</h3>
                  <p className="text-muted-foreground">Products are being loaded or there are no products to display.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <OrderBook userId={user?.id} />
        </TabsContent>

        <TabsContent value="alerts">
          <PriceAlerts products={products} />
        </TabsContent>
      </Tabs>

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct?.orderType === 'buy' ? 'Buy' : 'Sell'} Order
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.orderType === 'buy' 
                ? `Place a buy order for ${selectedProduct?.name}` 
                : `Place a sell order for ${selectedProduct?.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <OrderForm
              product={selectedProduct}
              onOrderSuccess={handleOrderSuccess}
              onClose={() => setIsOrderDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trading;
