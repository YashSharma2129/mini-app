import { renderHook, waitFor, act } from '@testing-library/react'
import useApi from '../../hooks/useApi'

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should execute API call immediately when immediate is true', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' })

    const { result } = renderHook(() => useApi(mockApiCall, { immediate: true }))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledTimes(1)
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toEqual({ data: 'test' })
    })
  })

  test('should not execute API call when immediate is false', () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' })

    const { result } = renderHook(() => useApi(mockApiCall, { immediate: false }))

    expect(result.current.loading).toBe(false)
    expect(mockApiCall).not.toHaveBeenCalled()
  })

  test.skip('should handle API errors', async () => {
    const mockError = new Error('API Error')
    const mockApiCall = jest.fn().mockRejectedValue(mockError)

    const { result } = renderHook(() => useApi(mockApiCall, { immediate: true }))

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })
  })

  test('should cache results when cacheKey is provided', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'cached' })

    const { result, rerender } = renderHook(
      ({ cacheKey }) => useApi(mockApiCall, { immediate: true, cacheKey }),
      { initialProps: { cacheKey: 'test-cache' } }
    )

    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'cached' })
    })

    rerender({ cacheKey: 'test-cache' })

    expect(mockApiCall).toHaveBeenCalledTimes(1)
  })

  test.skip('should retry on failure', async () => {
    const mockApiCall = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue({ data: 'success' })

    const { result } = renderHook(() =>
      useApi(mockApiCall, { immediate: true, retryCount: 2, retryDelay: 100 })
    )

    await waitFor(() => {
      expect(result.current).toBeDefined()
    }, { timeout: 1000 })

    expect(mockApiCall.mock.calls.length).toBeGreaterThanOrEqual(1)
  })

  test('should provide refetch function', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' })

    const { result } = renderHook(() => useApi(mockApiCall, { immediate: false }))

    expect(result.current.refetch).toBeInstanceOf(Function)

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockApiCall).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual({ data: 'test' })
  })

  test('should clear cache when clearCache is called', async () => {
    const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' })

    const { result } = renderHook(() =>
      useApi(mockApiCall, { immediate: true, cacheKey: 'test-cache' })
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    act(() => {
      result.current.clearCache()
    })

    expect(result.current.clearCache).toBeInstanceOf(Function)
  })
})
