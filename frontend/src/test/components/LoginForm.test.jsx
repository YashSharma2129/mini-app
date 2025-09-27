import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginForm from '../../components/auth/LoginForm'
import { AuthProvider } from '../../context/AuthContext'

jest.mock('../../utils/api', () => ({
  authAPI: {
    login: jest.fn()
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

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders login form correctly', () => {
    renderWithProviders(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/create a new account/i)).toBeInTheDocument()
  })

  test('shows validation errors for empty fields', async () => {
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
    })
    
    expect(emailInput).toHaveValue('invalid-email')
    expect(passwordInput).toHaveValue('123')
  })

  test('shows validation error for invalid email', async () => {
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.change(passwordInput, { target: { value: 'validpassword123' } })
      fireEvent.click(submitButton)
    })
    
    expect(emailInput).toHaveValue('invalid-email')
    expect(passwordInput).toHaveValue('validpassword123')
  })

  test('shows validation error for short password', async () => {
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
    })
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('123')
  })

  test('handles successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      data: {
        data: {
          user: { id: 1, name: 'Test User' },
          token: 'mock-token'
        }
      }
    })
    
    jest.mocked(require('../../utils/api').authAPI.login).mockImplementation(mockLogin)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
    })
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      })
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('handles login error', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
    
    jest.mocked(require('../../utils/api').authAPI.login).mockImplementation(mockLogin)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
    })
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  test('toggles password visibility', () => {
    renderWithProviders(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    const toggleButton = passwordInput.parentElement.querySelector('button')
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    act(() => {
      fireEvent.click(toggleButton)
    })
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    act(() => {
      fireEvent.click(toggleButton)
    })
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('shows loading state during login', async () => {
    const mockLogin = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    jest.mocked(require('../../utils/api').authAPI.login).mockImplementation(mockLogin)
    
    renderWithProviders(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
    })
    
    expect(submitButton).toHaveTextContent(/signing in/i)
    
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/sign in/i)
    })
  })
})