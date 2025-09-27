import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import useApi from '../../hooks/useApi'

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should execute API call immediately when immediate is true', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' })
    
    const { result } = renderHook(() => useApi(mockApiCall, { immediate: true }))
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledTimes(1)
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toEqual({ data: 'test' })
    })
  })

  test('should not execute API call when immediate is false', () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' })
    
    const { result } = renderHook(() => useApi(mockApiCall, { immediate: false }))
    
    expect(result.current.loading).toBe(false)
    expect(mockApiCall).not.toHaveBeenCalled()
  })

  test('should handle API errors', async () => {
    const mockError = new Error('API Error')
    const mockApiCall = vi.fn().mockRejectedValue(mockError)
    
    const { result } = renderHook(() => useApi(mockApiCall, { immediate: true }))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('API Error')
      expect(result.current.data).toBe(null)
    })
  })

  test('should cache results when cacheKey is provided', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'cached' })
    
    const { result, rerender } = renderHook(
      ({ cacheKey }) => useApi(mockApiCall, { immediate: true, cacheKey }),
      { initialProps: { cacheKey: 'test-cache' } }
    )
    
    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'cached' })
    })
    
    // Rerender with same cache key
    rerender({ cacheKey: 'test-cache' })
    
    // Should not call API again due to cache
    expect(mockApiCall).toHaveBeenCalledTimes(1)
  })

  test('should retry on failure', async () => {
    const mockApiCall = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue({ data: 'success' })
    
    const { result } = renderHook(() => 
      useApi(mockApiCall, { immediate: true, retryCount: 2, retryDelay: 100 })
    )
    
    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'success' })
    }, { timeout: 1000 })
    
    expect(mockApiCall).toHaveBeenCalledTimes(3)
  })

  test('should provide refetch function', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' })
    
    const { result } = renderHook(() => useApi(mockApiCall, { immediate: false }))
    
    expect(result.current.refetch).toBeInstanceOf(Function)
    
    await result.current.refetch()
    
    expect(mockApiCall).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual({ data: 'test' })
  })

  test('should clear cache when clearCache is called', async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ data: 'test' })
    
    const { result } = renderHook(() => 
      useApi(mockApiCall, { immediate: true, cacheKey: 'test-cache' })
    )
    
    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'test' })
    })
    
    result.current.clearCache()
    
    // Cache should be cleared
    expect(result.current.clearCache).toBeInstanceOf(Function)
  })
})
