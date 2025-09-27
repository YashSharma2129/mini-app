import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Portfolio from '../../pages/Portfolio'
import { AuthProvider } from '../../context/AuthContext'
import { mockPortfolio, mockUser } from '../__mocks__/api'

// Mock the API
jest.mock('../../utils/api', () => ({
  portfolioAPI: {
    getPortfolio: jest.fn(),
    getPortfolioSummary: jest.fn(),
    getWatchlist: jest.fn()
  },
  analyticsAPI: {
    getPortfolioAnalytics: jest.fn()
  }
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Mock useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Portfolio', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify(mockUser))
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('renders portfolio page', async () => {
    const mockGetPortfolio = jest.fn().mockResolvedValue({
      data: { data: { portfolio: [] } }
    })
    
    const mockGetPortfolioSummary = jest.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 0, 
          current_value: 0, 
          total_returns: 0, 
          returns_percentage: 0 
        } 
      }
    })
    
    const mockGetWatchlist = jest.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    jest.mocked(require('../../utils/api').portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getAllByText(/portfolio/i)[0]).toBeInTheDocument()
      expect(screen.getByText(/total invested/i)).toBeInTheDocument()
      expect(screen.getByText(/current value/i)).toBeInTheDocument()
    })
  })

  test('displays portfolio holdings', async () => {
    const mockGetPortfolio = jest.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = jest.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      }
    })
    
    const mockGetWatchlist = jest.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    jest.mocked(require('../../utils/api').portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getAllByText(/₹24,000/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/₹24,507.50/)[0]).toBeInTheDocument()
    })
  })

  test('displays portfolio summary correctly', async () => {
    const mockGetPortfolio = jest.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = jest.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      }
    })
    
    const mockGetWatchlist = jest.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    jest.mocked(require('../../utils/api').portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getAllByText(/₹24,000/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/₹24,507.50/)[0]).toBeInTheDocument()
      expect(screen.getByText(/₹507.50/)).toBeInTheDocument()
    })
  })

  test('displays empty state when no holdings', async () => {
    const mockGetPortfolio = jest.fn().mockResolvedValue({
      data: { data: { portfolio: [] } }
    })
    
    const mockGetPortfolioSummary = jest.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 0, 
          current_value: 0, 
          total_returns: 0, 
          returns_percentage: 0 
        } 
      }
    })
    
    const mockGetWatchlist = jest.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    jest.mocked(require('../../utils/api').portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText(/no holdings yet/i)).toBeInTheDocument()
      expect(screen.getByText(/start building your portfolio by investing in products/i)).toBeInTheDocument()
    })
  })

  test('handles API errors gracefully', async () => {
    const mockGetPortfolio = jest.fn().mockRejectedValue(new Error('API Error'))
    
    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)

    renderWithProviders(<Portfolio />)

        await waitFor(() => {
          expect(screen.getAllByText(/portfolio/i)[0]).toBeInTheDocument()
        })
  })

  test('shows loading state initially', () => {
    const mockGetPortfolio = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)

    renderWithProviders(<Portfolio />)
              
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('displays portfolio analytics when available', async () => {
    const mockGetPortfolio = jest.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = jest.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      }
    })
    
    const mockGetWatchlist = jest.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })
    
    const mockGetAnalytics = jest.fn().mockResolvedValue({
      data: { data: { analytics: {} } }
    })

    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    jest.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    jest.mocked(require('../../utils/api').portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)
    jest.mocked(require('../../utils/api').analyticsAPI.getPortfolioAnalytics).mockImplementation(mockGetAnalytics)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText(/performance/i)).toBeInTheDocument()
    })
  })
})