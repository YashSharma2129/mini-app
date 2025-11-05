import { describe, test, beforeEach, expect, vi } from 'vitest'

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
}

vi.mock('axios', () => ({
  default: {
    create: () => mockAxios,
    get: mockAxios.get,
    post: mockAxios.post,
    put: mockAxios.put,
    delete: mockAxios.delete
  }
}))

vi.mock('../../utils/api.jsx', () => {
  const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }

  return {
    authAPI: {
      register: (userData) => mockAxios.post('/auth/register', userData),
      login: (credentials) => mockAxios.post('/auth/login', credentials),
      getProfile: () => mockAxios.get('/auth/profile'),
      updateProfile: (userData) => mockAxios.put('/auth/profile', userData),
    },
    productsAPI: {
      getAllProducts: () => mockAxios.get('/products'),
      getProductById: (id) => mockAxios.get(`/products/${id}`),
      getProductsByCategory: (category) => mockAxios.get(`/products/category/${category}`),
      searchProducts: (query) => mockAxios.get(`/products/search?q=${query}`),
      createProduct: (productData) => mockAxios.post('/products', productData),
      updateProductPrice: (id, price) => mockAxios.put(`/products/${id}/price`, { price }),
    },
    portfolioAPI: {
      getPortfolio: () => mockAxios.get('/portfolio'),
      getPortfolioSummary: () => mockAxios.get('/portfolio/summary'),
      getWatchlist: () => mockAxios.get('/portfolio/watchlist'),
      addToWatchlist: (productId) => mockAxios.post(`/portfolio/watchlist/${productId}`),
      removeFromWatchlist: (productId) => mockAxios.delete(`/portfolio/watchlist/${productId}`),
    },
    transactionsAPI: {
      buyProduct: (transactionData) => mockAxios.post('/transactions/buy', transactionData),
      getUserTransactions: () => mockAxios.get('/transactions/my'),
      getAllTransactions: () => mockAxios.get('/transactions/all'),
      getTransactionStats: () => mockAxios.get('/transactions/stats'),
    }
  }
})

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock

Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})

const authAPI = {
  register: (userData) => mockAxios.post('/auth/register', userData),
  login: (credentials) => mockAxios.post('/auth/login', credentials),
  getProfile: () => mockAxios.get('/auth/profile'),
  updateProfile: (userData) => mockAxios.put('/auth/profile', userData),
}

const productsAPI = {
  getAllProducts: () => mockAxios.get('/products'),
  getProductById: (id) => mockAxios.get(`/products/${id}`),
  getProductsByCategory: (category) => mockAxios.get(`/products/category/${category}`),
  searchProducts: (query) => mockAxios.get(`/products/search?q=${query}`),
  createProduct: (productData) => mockAxios.post('/products', productData),
  updateProductPrice: (id, price) => mockAxios.put(`/products/${id}/price`, { price }),
}

const portfolioAPI = {
  getPortfolio: () => mockAxios.get('/portfolio'),
  getPortfolioSummary: () => mockAxios.get('/portfolio/summary'),
  getWatchlist: () => mockAxios.get('/portfolio/watchlist'),
  addToWatchlist: (productId) => mockAxios.post(`/portfolio/watchlist/${productId}`),
  removeFromWatchlist: (productId) => mockAxios.delete(`/portfolio/watchlist/${productId}`),
}

const transactionsAPI = {
  buyProduct: (transactionData) => mockAxios.post('/transactions/buy', transactionData),
  getUserTransactions: () => mockAxios.get('/transactions/my'),
  getAllTransactions: () => mockAxios.get('/transactions/all'),
  getTransactionStats: () => mockAxios.get('/transactions/stats'),
}

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Auth API', () => {
    test('login should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: 1, name: 'Test User' },
            token: 'mock-token'
          }
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await authAPI.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      })
      expect(result).toEqual(mockResponse)
    })

    test('register should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: 1, name: 'Test User' },
            token: 'mock-token'
          }
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await authAPI.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })
      expect(result).toEqual(mockResponse)
    })

    test('getProfile should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: { id: 1, name: 'Test User' }
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await authAPI.getProfile()

      expect(mockAxios.get).toHaveBeenCalledWith('/auth/profile')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Products API', () => {
    test('getAllProducts should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            products: [
              { id: 1, name: 'Product 1' },
              { id: 2, name: 'Product 2' }
            ]
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await productsAPI.getAllProducts()

      expect(mockAxios.get).toHaveBeenCalledWith('/products')
      expect(result).toEqual(mockResponse)
    })

    test('getProductById should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            product: { id: 1, name: 'Product 1' }
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await productsAPI.getProductById(1)

      expect(mockAxios.get).toHaveBeenCalledWith('/products/1')
      expect(result).toEqual(mockResponse)
    })

    test('getProductsByCategory should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            products: [
              { id: 1, name: 'Product 1', category: 'Stocks' }
            ]
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await productsAPI.getProductsByCategory('Stocks')

      expect(mockAxios.get).toHaveBeenCalledWith('/products/category/Stocks')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Portfolio API', () => {
    test('getPortfolio should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            portfolio: [
              { id: 1, product_name: 'Product 1', quantity: 10 }
            ]
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await portfolioAPI.getPortfolio()

      expect(mockAxios.get).toHaveBeenCalledWith('/portfolio')
      expect(result).toEqual(mockResponse)
    })

    test('getPortfolioSummary should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            total_invested: 10000,
            current_value: 10500,
            total_returns: 500,
            returns_percentage: 5.0
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await portfolioAPI.getPortfolioSummary()

      expect(mockAxios.get).toHaveBeenCalledWith('/portfolio/summary')
      expect(result).toEqual(mockResponse)
    })

    test('getWatchlist should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            watchlist: [
              { id: 1, name: 'Product 1' }
            ]
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await portfolioAPI.getWatchlist()

      expect(mockAxios.get).toHaveBeenCalledWith('/portfolio/watchlist')
      expect(result).toEqual(mockResponse)
    })

    test('addToWatchlist should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Product added to watchlist'
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await portfolioAPI.addToWatchlist(1)

      expect(mockAxios.post).toHaveBeenCalledWith('/portfolio/watchlist/1')
      expect(result).toEqual(mockResponse)
    })

    test('removeFromWatchlist should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Product removed from watchlist'
        }
      }

      mockAxios.delete.mockResolvedValue(mockResponse)

      const result = await portfolioAPI.removeFromWatchlist(1)

      expect(mockAxios.delete).toHaveBeenCalledWith('/portfolio/watchlist/1')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Transactions API', () => {
    test('buyProduct should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Product purchased successfully',
          data: {
            transaction: { id: 1, product_name: 'Product 1' }
          }
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await transactionsAPI.buyProduct({
        productId: 1,
        units: 1
      })

      expect(mockAxios.post).toHaveBeenCalledWith('/transactions/buy', {
        productId: 1,
        units: 1
      })
      expect(result).toEqual(mockResponse)
    })

    test('getUserTransactions should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            transactions: [
              { id: 1, product_name: 'Product 1', type: 'buy' }
            ]
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await transactionsAPI.getUserTransactions()

      expect(mockAxios.get).toHaveBeenCalledWith('/transactions/my')
      expect(result).toEqual(mockResponse)
    })

    test('getTransactionStats should make correct API call', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            total_transactions: 5,
            total_buy_amount: 10000,
            total_sell_amount: 5000
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await transactionsAPI.getTransactionStats()

      expect(mockAxios.get).toHaveBeenCalledWith('/transactions/stats')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockAxios.get.mockRejectedValue(networkError)

      try {
        await productsAPI.getAllProducts()
      } catch (error) {
        expect(error).toBe(networkError)
      }
    })

    test('should handle API errors', async () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Bad Request'
          }
        }
      }

      mockAxios.post.mockRejectedValue(apiError)

      try {
        await authAPI.login({ email: 'invalid', password: 'invalid' })
      } catch (error) {
        expect(error).toBe(apiError)
      }
    })
  })
})