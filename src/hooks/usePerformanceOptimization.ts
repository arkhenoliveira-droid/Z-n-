'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface UsePerformanceOptimizationOptions {
  cacheTTL?: number // Default: 5 minutes
  debounceMs?: number // Default: 300ms
  enableCache?: boolean // Default: true
  enableDebounce?: boolean // Default: true
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export function usePerformanceOptimization<T = any>(
  fetchFunction: (params?: any) => Promise<T>,
  options: UsePerformanceOptimizationOptions = {}
) {
  const {
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    debounceMs = 300,
    enableCache = true,
    enableDebounce = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  })

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate cache key based on function name and parameters
  const generateCacheKey = useCallback((params?: any): string => {
    const functionName = fetchFunction.name || 'anonymous'
    const paramsString = params ? JSON.stringify(params) : 'no-params'
    return `${functionName}:${paramsString}`
  }, [fetchFunction])

  // Check if cache entry is valid
  const isCacheValid = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp < entry.ttl
  }, [])

  // Get data from cache
  const getFromCache = useCallback((key: string): T | null => {
    if (!enableCache) return null

    const entry = cacheRef.current.get(key)
    if (entry && isCacheValid(entry)) {
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }))
      return entry.data
    }

    if (entry) {
      // Remove expired entry
      cacheRef.current.delete(key)
      setCacheStats(prev => ({ ...prev, size: cacheRef.current.size }))
    }

    return null
  }, [enableCache, isCacheValid])

  // Set data to cache
  const setToCache = useCallback((key: string, data: T): void => {
    if (!enableCache) return

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: cacheTTL
    }

    cacheRef.current.set(key, entry)
    setCacheStats(prev => ({
      ...prev,
      misses: prev.misses + 1,
      size: cacheRef.current.size
    }))
  }, [enableCache, cacheTTL])

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    setCacheStats(prev => ({ ...prev, size: 0 }))
  }, [])

  // Fetch data with caching and debouncing
  const fetchData = useCallback(async (params?: any): Promise<T> => {
    const cacheKey = generateCacheKey(params)

    // Try to get from cache first
    const cachedData = getFromCache(cacheKey)
    if (cachedData) {
      setData(cachedData)
      return cachedData
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction(params)

      // Cache the result
      setToCache(cacheKey, result)

      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, generateCacheKey, getFromCache, setToCache])

  // Debounced version of fetchData
  const debouncedFetchData = useCallback((params?: any) => {
    if (!enableDebounce) {
      return fetchData(params)
    }

    return new Promise<T>((resolve, reject) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(async () => {
        try {
          const result = await fetchData(params)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      }, debounceMs)
    })
  }, [fetchData, enableDebounce, debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    fetchData: debouncedFetchData,
    clearCache,
    cacheStats
  }
}

// Hook for paginated data with performance optimization
export function usePaginatedData<T>(
  fetchFunction: (page: number, limit: number, params?: any) => Promise<PaginatedResponse<T>>,
  options: UsePerformanceOptimizationOptions = {}
) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [paginatedData, setPaginatedData] = useState<T[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const { data, loading, error, fetchData, clearCache, cacheStats } = usePerformanceOptimization(
    (params?: { page: number; limit: number; [key: string]: any }) => {
      return fetchFunction(params?.page || currentPage, params?.limit || itemsPerPage, params)
    },
    options
  )

  // Update paginated data when data changes
  useEffect(() => {
    if (data && typeof data === 'object' && 'data' in data) {
      const paginatedResponse = data as PaginatedResponse<T>
      setPaginatedData(paginatedResponse.data)
      setTotalItems(paginatedResponse.total)
      setTotalPages(paginatedResponse.totalPages)
      setCurrentPage(paginatedResponse.page)
    }
  }, [data])

  const loadPage = useCallback((page: number, params?: any) => {
    setCurrentPage(page)
    return fetchData({ page, limit: itemsPerPage, ...params })
  }, [fetchData, itemsPerPage])

  const changeItemsPerPage = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page
    return fetchData({ page: 1, limit: newItemsPerPage })
  }, [fetchData])

  const refresh = useCallback((params?: any) => {
    return fetchData({ page: currentPage, limit: itemsPerPage, ...params })
  }, [fetchData, currentPage, itemsPerPage])

  return {
    data: paginatedData,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    loadPage,
    changeItemsPerPage,
    refresh,
    clearCache,
    cacheStats
  }
}

// Hook for real-time data with performance optimization
export function useRealTimeData<T>(
  fetchFunction: () => Promise<T>,
  updateInterval: number = 30000, // 30 seconds default
  options: UsePerformanceOptimizationOptions = {}
) {
  const { data, loading, error, fetchData, clearCache, cacheStats } = usePerformanceOptimization(
    fetchFunction,
    options
  )

  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up interval for real-time updates
    const interval = setInterval(() => {
      fetchData()
    }, updateInterval)

    return () => clearInterval(interval)
  }, [fetchData, updateInterval])

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    clearCache,
    cacheStats
  }
}