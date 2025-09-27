import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  TrendingUp,
  Wallet,
  Bell
} from 'lucide-react';
import { Button } from '../ui/button';
import NotificationCenter from '../notifications/NotificationCenter';
import ThemeToggle from '../ThemeToggle';
import WebSocketStatus from '../WebSocketStatus';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-foreground">TradingApp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/products"
              className="text-muted-foreground hover:text-primary-600 transition-colors"
            >
              Products
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/portfolio"
                  className="text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  Portfolio
                </Link>
                <Link
                  to="/transactions"
                  className="text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  Transactions
                </Link>
                <Link
                  to="/trading"
                  className="text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  Trading
                </Link>
                <Link
                  to="/analytics"
                  className="text-muted-foreground hover:text-primary-600 transition-colors"
                >
                  Analytics
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-muted-foreground hover:text-primary-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated && <WebSocketStatus />}
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 text-foreground hover:text-primary-600 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-50 border border-border">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center mt-1">
                        <Wallet className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">
                          ₹{user?.wallet_balance?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-muted-foreground hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/products"
                className="text-muted-foreground hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/portfolio"
                    className="text-muted-foreground hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Portfolio
                  </Link>
                  <Link
                    to="/transactions"
                    className="text-muted-foreground hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Transactions
                  </Link>
                  <Link
                    to="/trading"
                    className="text-muted-foreground hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Trading
                  </Link>
                  <Link
                    to="/analytics"
                    className="text-muted-foreground hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-muted-foreground hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block text-muted-foreground hover:text-primary-600 transition-colors mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-muted-foreground hover:text-primary-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
