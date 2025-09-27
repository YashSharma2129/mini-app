// Mock API responses for testing
export const mockProducts = [
  {
    id: 1,
    name: 'Reliance Industries Ltd',
    category: 'Stocks',
    price: 2450.75,
    description: 'Leading Indian conglomerate',
    pe_ratio: 18.5,
    market_cap: 16500000000000,
    volume: 2500000
  },
  {
    id: 2,
    name: 'TCS',
    category: 'Stocks',
    price: 3850.25,
    description: 'Global IT services',
    pe_ratio: 25.8,
    market_cap: 14000000000000,
    volume: 1800000
  }
]

export const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  wallet_balance: 100000,
  kyc_status: 'approved'
}

export const mockPortfolio = [
  {
    id: 1,
    product_id: 1,
    product_name: 'Reliance Industries Ltd',
    quantity: 10,
    average_price: 2400,
    current_price: 2450.75,
    total_invested: 24000,
    current_value: 24507.5,
    returns: 507.5,
    returns_percentage: 2.11
  }
]

export const mockTransactions = [
  {
    id: 1,
    product_name: 'Reliance Industries Ltd',
    type: 'buy',
    units: 10,
    price_per_unit: 2400,
    total_amount: 24000,
    created_at: '2024-01-15T10:30:00Z'
  }
]

// Mock API functions
export const mockApi = {
  products: {
    getAllProducts: () => Promise.resolve({ data: { data: { products: mockProducts } } }),
    getProductById: (id) => Promise.resolve({ data: { data: { product: mockProducts.find(p => p.id === id) } } })
  },
  auth: {
    login: () => Promise.resolve({ data: { data: { user: mockUser, token: 'mock-token' } } }),
    register: () => Promise.resolve({ data: { data: { user: mockUser, token: 'mock-token' } } }),
    getProfile: () => Promise.resolve({ data: { data: { user: mockUser } } })
  },
  portfolio: {
    getPortfolio: () => Promise.resolve({ data: { data: { portfolio: mockPortfolio } } }),
    getPortfolioSummary: () => Promise.resolve({ 
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      } 
    })
  },
  transactions: {
    getUserTransactions: () => Promise.resolve({ data: { data: { transactions: mockTransactions } } })
  }
}
