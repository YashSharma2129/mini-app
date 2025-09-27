import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProductCard from '../../components/products/ProductCard'
import { AuthProvider } from '../../context/AuthContext'
import { mockProducts } from '../__mocks__/api'

// Mock the API
jest.mock('../../utils/api', () => ({
  portfolioAPI: {
    addToWatchlist: jest.fn(() => Promise.resolve()),
    removeFromWatchlist: jest.fn(() => Promise.resolve())
  }
}))

// Mock the toast hook
jest.mock('../../hooks/use-toast', () => ({
  toast: jest.fn()
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

describe('ProductCard', () => {
  const mockProduct = mockProducts[0]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders product information correctly', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
    expect(screen.getByText('Leading Indian conglomerate')).toBeInTheDocument()
    expect(screen.getByText('₹2,450.75')).toBeInTheDocument()
    expect(screen.getByText('Stocks')).toBeInTheDocument()
  })

  test('displays price change indicator', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    // Price change should be displayed (mock data includes random change)
    const priceChangeElement = screen.getByText(/\+\d+\.\d+%|-\d+\.\d+%/)
    expect(priceChangeElement).toBeInTheDocument()
  })

  test('shows watchlist heart icon', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    const heartIcon = screen.getByRole('button', { name: /watchlist/i })
    expect(heartIcon).toBeInTheDocument()
  })

  test('handles watchlist toggle for authenticated user', async () => {
    // Mock authenticated user
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }))
    
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    const heartButton = screen.getByRole('button', { name: /watchlist/i })
    fireEvent.click(heartButton)
    
    await waitFor(() => {
      expect(heartButton).toBeInTheDocument()
    })
  })

  test('shows view and buy buttons', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('View')).toBeInTheDocument()
    expect(screen.getByText('Buy')).toBeInTheDocument()
  })

  test('displays market data when available', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText(/Market Cap:/)).toBeInTheDocument()
    expect(screen.getByText(/Volume:/)).toBeInTheDocument()
  })

  test('shows rating', () => {
    renderWithProviders(<ProductCard product={mockProduct} />)
    
    // Rating should be displayed (mock data includes random rating)
    const ratingElement = screen.getByText(/\d\.\d/)
    expect(ratingElement).toBeInTheDocument()
  })
})
