import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Portfolio from '../../pages/Portfolio'
import { AuthProvider } from '../../context/AuthContext'
import { mockPortfolio, mockUser } from '../__mocks__/api'

// Mock the API
vi.mock('../../utils/api', () => ({
  portfolioAPI: {
    getPortfolio: vi.fn(),
    getPortfolioSummary: vi.fn()
  },
  analyticsAPI: {
    getPortfolioAnalytics: vi.fn()
  }
}))

// Mock the toast hook
vi.mock('../../hooks/use-toast', () => ({
  toast: vi.fn()
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
    
    // Mock authenticated user
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify(mockUser))
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('renders portfolio page correctly', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      }
    })

    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText(/portfolio/i)).toBeInTheDocument()
      expect(screen.getByText(/total invested/i)).toBeInTheDocument()
      expect(screen.getByText(/current value/i)).toBeInTheDocument()
    })
  })

  test('displays portfolio holdings', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      }
    })

    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText(/₹24,000/)).toBeInTheDocument()
      expect(screen.getByText(/₹24,507.50/)).toBeInTheDocument()
    })
  })

  test('displays portfolio summary correctly', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      }
    })

    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText(/₹24,000/)).toBeInTheDocument()
      expect(screen.getByText(/₹24,507.50/)).toBeInTheDocument()
      expect(screen.getByText(/₹507.50/)).toBeInTheDocument()
      expect(screen.getByText(/2.11%/)).toBeInTheDocument()
    })
  })

  test('handles empty portfolio', async () => {
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

    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText(/no holdings found/i)).toBeInTheDocument()
      expect(screen.getByText(/start building your portfolio/i)).toBeInTheDocument()
    })
  })

  test('handles API errors gracefully', async () => {
    const mockGetPortfolio = vi.fn().mockRejectedValue(new Error('API Error'))
    
    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText(/error loading portfolio/i)).toBeInTheDocument()
    })
  })

  test('shows loading state initially', () => {
    const mockGetPortfolio = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)

    renderWithProviders(<Portfolio />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  test('displays portfolio analytics when available', async () => {
    const mockGetPortfolio = vi.fn().mockResolvedValue({
      data: { data: { portfolio: mockPortfolio } }
    })
    
    const mockGetPortfolioSummary = vi.fn().mockResolvedValue({
      data: { 
        data: { 
          total_invested: 24000, 
          current_value: 24507.5, 
          total_returns: 507.5, 
          returns_percentage: 2.11 
        } 
      }
    })

    const mockAnalytics = {
      portfolio: {
        totalInvested: 24000,
        totalCurrentValue: 24507.5,
        totalUnrealizedPnL: 507.5,
        totalReturnPercentage: 2.11
      },
      allocation: {
        'Stocks': { invested: 24000, current: 24507.5, percentage: 100 }
      }
    }

    const mockGetAnalytics = vi.fn().mockResolvedValue({
      data: { data: mockAnalytics }
    })

    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolio).mockImplementation(mockGetPortfolio)
    vi.mocked(require('../../utils/api').portfolioAPI.getPortfolioSummary).mockImplementation(mockGetPortfolioSummary)
    vi.mocked(require('../../utils/api').analyticsAPI.getPortfolioAnalytics).mockImplementation(mockGetAnalytics)

    renderWithProviders(<Portfolio />)

    await waitFor(() => {
      expect(screen.getByText(/analytics/i)).toBeInTheDocument()
    })
  })
})
