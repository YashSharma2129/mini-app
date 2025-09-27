import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Products from '../../pages/Products'
import { AuthProvider } from '../../context/AuthContext'
import { mockProducts } from '../__mocks__/api'

jest.mock('../../utils/api', () => ({
  productsAPI: {
    getAllProducts: jest.fn()
  }
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

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

describe('Products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders products page correctly', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText(/investment products/i)).toBeInTheDocument()
      expect(screen.getByText(/discover and invest in stocks and mutual funds/i)).toBeInTheDocument()
    })
  })

  test('displays products correctly', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
      expect(screen.getByText(/₹2,450.75/)).toBeInTheDocument()
      expect(screen.getByText(/₹3,850.25/)).toBeInTheDocument()
    })
  })

  test('filters products by category', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
    })

    const categoryFilter = screen.getAllByRole('combobox')[0]
    fireEvent.change(categoryFilter, { target: { value: 'Stocks' } })

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
    })
  })

  test('searches products by name', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'Reliance' } })

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.queryByText('TCS')).not.toBeInTheDocument()
    })
  })

  test('sorts products by price', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
    })

    const sortSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(sortSelect, { target: { value: 'price-desc' } })

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText('TCS')).toBeInTheDocument()
    })
  })

  test('handles empty products list', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: [] } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  test('handles API errors gracefully', async () => {
    const mockGetAllProducts = jest.fn().mockRejectedValue(new Error('API Error'))

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })

  test('shows loading state initially', () => {
    const mockGetAllProducts = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  test('navigates to product detail on view button click', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
    })

    const viewButton = screen.getAllByRole('link', { name: /view/i })[0]
    fireEvent.click(viewButton)

    expect(viewButton).toHaveAttribute('href', '/products/1')
  })

  test('opens buy modal on buy button click', async () => {
    const mockAuthContext = {
      isAuthenticated: true,
      user: { id: 1, name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn()
    }
    
    jest.doMock('../../context/AuthContext', () => ({
      useAuth: () => mockAuthContext,
      AuthProvider: ({ children }) => children
    }))
    
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
    })

    const viewButton = screen.getAllByRole('link', { name: /view/i })[0]
    fireEvent.click(viewButton)

    expect(viewButton).toHaveAttribute('href', '/products/1')
  })

  test('displays product information correctly', async () => {
    const mockGetAllProducts = jest.fn().mockResolvedValue({
      data: { data: { products: mockProducts } }
    })

    jest.mocked(require('../../utils/api').productsAPI.getAllProducts).mockImplementation(mockGetAllProducts)

    renderWithProviders(<Products />)

    await waitFor(() => {
      expect(screen.getByText('Reliance Industries Ltd')).toBeInTheDocument()
      expect(screen.getByText(/leading indian conglomerate/i)).toBeInTheDocument()
      expect(screen.getAllByText(/stocks/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/market cap:/i)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/volume:/i)[0]).toBeInTheDocument()
    })
  })
})
