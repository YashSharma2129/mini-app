import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useApi = (apiCall, options = {}) => {
  const {
    immediate = true,
    cacheKey = null,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess = null,
    onError = null,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (params = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
        setData(cachedData.data);
        return cachedData.data;
      } else {
        cache.delete(cacheKey);
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall(params, abortControllerRef.current.signal);
      
      // Cache the result
      if (cacheKey) {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      setData(result);
      setRetryAttempts(0);

      if (onSuccess) {
        onSuccess(result);
      }

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return result;
    } catch (err) {
      // Don't handle aborted requests
      if (err.name === 'AbortError') {
        return;
      }

      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';

      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      // Retry logic
      if (retryAttempts < retryCount) {
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1);
          execute(params);
        }, retryDelay * Math.pow(2, retryAttempts)); // Exponential backoff
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, cacheKey, retryCount, retryDelay, retryAttempts, onSuccess, onError, showErrorToast, showSuccessToast, successMessage]);

  const refetch = useCallback((params = {}) => {
    // Clear cache if refetching
    if (cacheKey && cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }
    return execute(params);
  }, [execute, cacheKey]);

  const clearCache = useCallback(() => {
    if (cacheKey && cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }
  }, [cacheKey]);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    retryAttempts,
    execute,
    refetch,
    clearCache
  };
};

export default useApi;
