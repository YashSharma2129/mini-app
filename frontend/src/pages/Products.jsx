import React, { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { TrendingUp, Grid, List } from 'lucide-react';
import { Button } from '../components/ui/button';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      setProducts(response.data.data.products);
    } catch (error) {
      // Error handled by UI state
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product =>
        product.category === selectedCategory
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'market_cap':
          return (b.market_cap || 0) - (a.market_cap || 0);
        case 'volume':
          return (b.volume || 0) - (a.volume || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('name');
  };

  const handleWatchlistUpdate = () => {
    // Refresh products to update watchlist status
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Investment Products</h1>
              <p className="text-muted-foreground mt-2">
                Discover and invest in stocks and mutual funds
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-card rounded-lg shadow-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'shadow-lg' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'shadow-lg' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />

        {/* Enhanced Results Summary */}
        <div className="mb-6">
          <div className="bg-card rounded-lg shadow-lg p-4 border-0">
            <p className="text-muted-foreground font-medium">
              Showing <span className="text-primary font-bold">{filteredProducts.length}</span> of <span className="text-foreground font-bold">{products.length}</span> products
            </p>
          </div>
        </div>

        {/* Enhanced Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-card rounded-xl shadow-lg p-8 border-0">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onWatchlistUpdate={handleWatchlistUpdate}
              />
            ))}
          </div>
        )}

        {/* Enhanced Load More Button (for future pagination) */}
        {filteredProducts.length > 0 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              className="shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Load More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
