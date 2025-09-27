import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA' ||
      event.target.contentEditable === 'true'
    ) {
      return;
    }

    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      navigate('/products');
      return;
    }

    // Ctrl/Cmd + D for dashboard
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      if (isAuthenticated) {
        navigate('/dashboard');
      }
      return;
    }

    // Ctrl/Cmd + P for portfolio
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      if (isAuthenticated) {
        navigate('/portfolio');
      }
      return;
    }

    // Ctrl/Cmd + T for trading
    if ((event.ctrlKey || event.metaKey) && event.key === 't') {
      event.preventDefault();
      if (isAuthenticated) {
        navigate('/trading');
      }
      return;
    }

    // Ctrl/Cmd + H for home
    if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
      event.preventDefault();
      navigate('/');
      return;
    }

    // Ctrl/Cmd + L for login
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault();
      if (!isAuthenticated) {
        navigate('/login');
      }
      return;
    }

    // Ctrl/Cmd + Shift + L for logout
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'L') {
      event.preventDefault();
      if (isAuthenticated) {
        logout();
        navigate('/');
      }
      return;
    }

    // Escape key for closing modals/going back
    if (event.key === 'Escape') {
      event.preventDefault();
      // This could be enhanced to close modals or go back
      if (window.history.length > 1) {
        window.history.back();
      }
      return;
    }
  }, [navigate, isAuthenticated, logout]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
