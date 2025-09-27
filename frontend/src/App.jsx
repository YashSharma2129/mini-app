import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { WebSocketProvider } from './context/WebSocketContext.jsx';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import OfflineIndicator from './components/OfflineIndicator.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts.jsx';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/ui/LoadingSpinner';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const KYC = lazy(() => import('./pages/KYC.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Portfolio = lazy(() => import('./pages/Portfolio.jsx'));
const Transactions = lazy(() => import('./pages/Transactions.jsx'));
const Trading = lazy(() => import('./pages/Trading.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  useKeyboardShortcuts();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

// App Component
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <div className="App">
                <Toaster />
                <PWAInstallPrompt />
                <OfflineIndicator />
                
                <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <AppLayout>
                  <Home />
                </AppLayout>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/kyc"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <KYC />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <AppLayout>
                  <Products />
                </AppLayout>
              }
            />
            <Route
              path="/products/:id"
              element={
                <AppLayout>
                  <ProductDetail />
                </AppLayout>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Portfolio />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Transactions />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/trading"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Trading />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Admin />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </WebSocketProvider>
    </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
