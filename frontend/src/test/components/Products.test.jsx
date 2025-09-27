import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Products from '../../pages/Products'
import { AuthProvider } from '../../context/AuthContext'
import { mockProducts } from '../__mocks__/api'

// Mock the API
vi.mock('../../utils/api', () => ({
  productsAPI: {
    getAllProducts: vi.fn()
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

describe('Products', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders products page correctly', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText(/products/i)).toBeInTheDocument()
      expect(screen.getByText(/filter by category/i)).toBeInTheDocument()
    })
  })

  test('displays products correctly', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
      expect(screen.getByText(/₹2,450.75/)).toBeInTheDocument()
      expect(screen.getByText(/₹3,850.25/)).toBeInTheDocument()
    })
  })

  test('filters products by category', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
    })

    // Filter by Stocks category
    const categoryFilter = screen.getByLabelText(/filter by category/i)
    fireEvent.change(categoryFilter, { target: { value: 'Stocks' } })

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
    })
  })

  test('searches products by name', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
    })

    // Search for Reliance
    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'Reliance' } })

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.queryByText('TCS')).not.toBeInTheDocument()
    })
  })

  test('sorts products by price', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
    })

    // Sort by price high to low
    const sortSelect = screen.getByLabelText(/sort by/i)
    fireEvent.change(sortSelect, { target: { value: 'price-desc' } })

    await waitFor(() => {
      const productCards = screen.getAllByTestId('product-card')
      expect(productCards).toHaveLength(2)
    })
  })

  test('handles empty products list', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: [] } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  test('handles API errors gracefully', async () => {
    const mockGetAllProducts = vi.fn().mockRejectedValue(new Error('API Error'))

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText(/error loading products/i)).toBeInTheDocument()
    })
  })

  test('shows loading state initially', () => {
    const mockGetAllProducts = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  test('navigates to product detail on view button click', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
    })

    const viewButton = screen.getAllByText('View')[0]
    fireEvent.click(viewButton)

    expect(mockNavigate).toHaveBeenCalledWith('/products/1')
  })

  test('opens buy modal on buy button click', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
    })

    const buyButton = screen.getAllByText('Buy')[0]
    fireEvent.click(buyButton)

    await waitFor(() => {
      expect(screen.getByText(/buy product/i)).toBeInTheDocument()
    })
  })

  test('displays product information correctly', async () => {
    const mockGetAllProducts = vi.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    vi.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText(/leading indian conglomerate/i)).toBeInTheDocument()
      expect(screen.getByText(/stocks/i)).toBeInTheDocument()
      expect(screen.getByText(/market cap:/i)).toBeInTheDocument()
      expect(screen.getByText(/volume:/i)).toBeInTheDocument()
    })
  })
})
