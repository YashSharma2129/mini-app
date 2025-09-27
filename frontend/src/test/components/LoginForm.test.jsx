import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import LoginForm from '../../components/auth/LoginForm'
import { AuthProvider } from '../../context/AuthContext'

// Mock the API
vi.mock('../../utils/api', () => ({
  authAPI: {
    login: vi.fn()
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders login form correctly', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  test('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  test('shows validation error for invalid email', async () => {
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  test('shows validation error for short password', async () => {
    renderWithProviders(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  test('handles successful login', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      success: true,
      data: {
        user: { id: 1, name: 'Test User' },
        token: 'mock-token'
      }
    })
    
    vi.mocked(require('../../utils/api').authAPI.login).mockImplementation(mockLogin)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('handles login error', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    
    vi.mocked(require('../../utils/api').authAPI.login).mockImplementation(mockLogin)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
      // Error should be handled gracefully
    })
  })

  test('toggles password visibility', () => {
    renderWithProviders(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('shows loading state during login', async () => {
    const mockLogin = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    vi.mocked(require('../../utils/api').authAPI.login).mockImplementation(mockLogin)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})
