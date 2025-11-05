import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, test, beforeEach, expect, vi } from 'vitest'
import Portfolio from '../../pages/Portfolio'
import { AuthProvider } from '../../context/AuthContext'
import { mockPortfolio, mockUser } from '../__mocks__/api'

// Mock the API
vi.mock('../../utils/api', () => ({
  portfolioAPI: {
    getPortfolio: vi.fn(),
    getPortfolioSummary: vi.fn(),
    getWatchlist: vi.fn()
  },
  analyticsAPI: {
    getPortfolioAnalytics: vi.fn()
  }
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn() 
  }
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

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
    vi.clearAllMocks()
  })

  test('renders portfolio page', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 10000, 
          current_value: 10500, 
          total_returns: 500, 
          returns_percentage: 5.0 
        } 
      }
    })
    
    const mockGetWatchlist = vi.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    const apiModule = await import('../../utils/api')
    vi.mocked(apiModule.portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(apiModule.portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    vi.mocked(apiModule.portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getAllByText(/portfolio/i)[0]).toBeInTheDocument()
      expect(screen.getByText(/total invested/i)).toBeInTheDocument()
      expect(screen.getAllByText(/current value/i)[0]).toBeInTheDocument()
    })
  })

  test('displays portfolio holdings', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 10000, 
          current_value: 10500, 
          total_returns: 500, 
          returns_percentage: 5.0 
        } 
      }
    })
    
    const mockGetWatchlist = vi.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    const apiModule = await import('../../utils/api')
    vi.mocked(apiModule.portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(apiModule.portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    vi.mocked(apiModule.portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    })
  })

  test('displays portfolio summary correctly', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: [] } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 10000, 
          current_value: 10500, 
          total_returns: 500, 
          returns_percentage: 5.0 
        } 
      }
    })
    
    const mockGetWatchlist = vi.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    const apiModule = await import('../../utils/api')
    vi.mocked(apiModule.portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(apiModule.portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    vi.mocked(apiModule.portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText('₹10,000.00')).toBeInTheDocument()
      expect(screen.getByText('₹10,500.00')).toBeInTheDocument()
      expect(screen.getByText('₹500.00')).toBeInTheDocument()
    })
  })

  test('displays empty state when no holdings', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: [] } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 0, 
          current_value: 0, 
          total_returns: 0, 
          returns_percentage: 0 
        } 
      }
    })
    
    const mockGetWatchlist = vi.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    const apiModule = await import('../../utils/api')
    vi.mocked(apiModule.portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(apiModule.portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    vi.mocked(apiModule.portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getAllByText(/portfolio/i)[0]).toBeInTheDocument()
    })
  })

  test('handles API errors gracefully', async () => {
    const mockGetPortfolio = vi.fn().mockRejectedValue(new Error('API Error'))
    
    const apiModule = await import('../../utils/api')
    vi.mocked(apiModule.portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getAllByText(/portfolio/i)[0]).toBeInTheDocument()
    })
  })

  test('shows loading state initially', async () => {
    const mockGetPortfolio = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    const apiModule = await import('../../utils/api')
    vi.mocked(apiModule.portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)

    renderWithProviders(<Portfolio />)

    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('displays portfolio analytics when available', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 10000, 
          current_value: 10500, 
          total_returns: 500, 
          returns_percentage: 5.0 
        } 
      }
    })
    
    const mockGetWatchlist = vi.fn().mockResolvedValue({
      data: { data: { watchlist: [] } }
    })

    const mockGetAnalytics = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          performance_chart: [],
          allocation_chart: []
        } 
      }
    })

    const apiModule = await import('../../utils/api')
    vi.mocked(apiModule.portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(apiModule.portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    vi.mocked(apiModule.portfolioAPI.getWatchlist).mockImplementation(mockGetWatchlist)
    vi.mocked(apiModule.analyticsAPI.getPortfolioAnalytics).mockImplementation(mockGetAnalytics)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    })
  })
})