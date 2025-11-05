// Mock API responses for testing
export const mockProducts = [
  {
    id: 1,
    name: 'Apple Inc.',
    category: 'Technology',
    price: 150.00,
    description: 'Leading technology company',
    pe_ratio: 18.5,
    market_cap: 16500000000000,
    volume: 2500000
  },
  {
    id: 2,
    name: 'Google LLC',
    category: 'Technology',
    price: 2800.25,
    description: 'Global technology company',
    pe_ratio: 25.8,
    market_cap: 14000000000000,
    volume: 1800000
  },
  {
    id: 3,
    name: 'Microsoft Corporation',
    category: 'Technology',
    price: 350.75,
    description: 'Software and cloud services',
    pe_ratio: 22.3,
    market_cap: 12000000000000,
    volume: 1500000
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
    product_name: 'Apple Inc.',
    quantity: 10,
    average_price: 140,
    current_price: 150.00,
    total_invested: 1400,
    current_value: 1500,
    returns: 100,
    returns_percentage: 7.14
  }
]

export const mockTransactions = [
  {
    id: 1,
    product_name: 'Apple Inc.',
    type: 'buy',
    units: 10,
    price_per_unit: 140,
    total_amount: 1400,
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
          total_invested: 1400, 
          current_value: 1500, 
          total_returns: 100, 
          returns_percentage: 7.14 
        } 
      } 
    })
  },
  transactions: {
    getUserTransactions: () => Promise.resolve({ data: { data: { transactions: mockTransactions } } })
  }
}
