import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const ProductFilters = ({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearFilters 
}) => {
  const categories = ['All', 'Stocks', 'Mutual Funds'];
  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'market_cap', label: 'Market Cap' },
    { value: 'volume', label: 'Volume' }
  ];

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || sortBy !== 'name';

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">
            Sort By
          </label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                Search: "{searchQuery}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-2 hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                Category: {selectedCategory}
                <button
                  onClick={() => onCategoryChange('All')}
                  className="ml-2 hover:text-green-600 dark:hover:text-green-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sortBy !== 'name' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                Sort: {sortOptions.find(opt => opt.value === sortBy)?.label}
                <button
                  onClick={() => onSortChange('name')}
                  className="ml-2 hover:text-yellow-600 dark:hover:text-yellow-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
