import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { getToken, getUser, setAuthData, clearAuthData, isAuthenticated } from '../utils/auth';
import { toast } from '../hooks/use-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const user = getUser();

      if (token && user && isAuthenticated()) {
        try {
          // Verify token with server
          const response = await authAPI.getProfile();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.data.user,
              token,
            },
          });
        } catch (error) {
          // Token is invalid, clear auth data
          clearAuthData();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;

      setAuthData(token, user);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast({
        title: "Login Successful",
        description: "Login successful!",
      });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Login failed';
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;

      setAuthData(token, user);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast({
        title: "Registration Successful",
        description: "Registration successful!",
      });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || 'Registration failed';
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    clearAuthData();
    dispatch({ type: 'LOGOUT' });
    toast({
      title: "Logged Out",
      description: "Logged out successfully",
    });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
