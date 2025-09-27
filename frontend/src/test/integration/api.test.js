import { vi, describe, test, expect, beforeEach } from 'vitest'
import { authAPI, productsAPI, portfolioAPI, transactionsAPI } from '../../utils/api'

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
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

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
      expect(result).toEqual(mockResponse.data)
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
