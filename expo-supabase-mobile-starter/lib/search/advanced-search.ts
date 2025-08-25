import { useState, useEffect, useMemo, useCallback } from 'react'
import { appAnalytics } from '../monitoring/app-analytics'

export interface SearchOptions {
  fuzzySearch?: boolean
  caseSensitive?: boolean
  maxResults?: number
  minScore?: number
  searchFields?: string[]
  boostFields?: Record<string, number>
  filters?: Record<string, unknown>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult<T> {
  item: T
  score: number
  matches: SearchMatch[]
  rank: number
}

export interface SearchMatch {
  field: string
  value: string
  indices: number[]
  score: number
}

export interface SearchState<T> {
  query: string
  results: SearchResult<T>[]
  isSearching: boolean
  totalResults: number
  searchTime: number
  suggestions: string[]
  filters: Record<string, unknown>
  hasMore: boolean
}

export interface SearchAnalytics {
  query: string
  resultCount: number
  searchTime: number
  userClickedResult?: boolean
  selectedResultIndex?: number
}

/**
 * Advanced search engine with fuzzy matching, ranking, and analytics
 */
export class AdvancedSearch<T> {
  private searchHistory: string[] = []
  private searchAnalytics: SearchAnalytics[] = []
  
  constructor(
    private data: T[],
    private options: SearchOptions = {}
  ) {
    this.options = {
      fuzzySearch: true,
      caseSensitive: false,
      maxResults: 50,
      minScore: 0.3,
      searchFields: [],
      boostFields: {},
      filters: {},
      sortBy: 'score',
      sortOrder: 'desc',
      ...options
    }
  }
  
  /**
   * Perform search with ranking and filtering
   */
  search(query: string): SearchResult<T>[] {
    const startTime = performance.now()
    
    if (!query.trim()) {
      return []
    }
    
    // Normalize query
    const normalizedQuery = this.options.caseSensitive 
      ? query.trim() 
      : query.trim().toLowerCase()
    
    // Get searchable fields
    const searchFields = this.getSearchFields()
    
    // Score and rank results
    const scoredResults = this.data
      .map((item) => this.scoreItem(item, normalizedQuery, searchFields))
      .filter(result => result.score >= (this.options.minScore || 0))
      .sort((a, b) => b.score - a.score)
      .slice(0, this.options.maxResults || 50)
      .map((result) => ({ ...result, rank: 0 }))
    
    // Apply filters
    const filteredResults = this.applyFilters(scoredResults)
    
    // Track analytics
    const searchTime = performance.now() - startTime
    this.trackSearch(query, filteredResults.length, searchTime)
    
    // Update search history
    this.updateSearchHistory(query)
    
    return filteredResults
  }
  
  /**
   * Score an individual item against the search query
   */
  private scoreItem(item: T, query: string, fields: string[]): SearchResult<T> {
    let totalScore = 0
    const matches: SearchMatch[] = []
    
    for (const field of fields) {
      const fieldValue = this.getFieldValue(item, field)
      if (fieldValue) {
        const fieldScore = this.scoreField(fieldValue, query, field)
        if (fieldScore.score > 0) {
          totalScore += fieldScore.score
          matches.push(fieldScore)
        }
      }
    }
    
    return {
      item,
      score: totalScore,
      matches,
      rank: 0 // Will be set later
    }
  }
  
  /**
   * Score a field value against the search query
   */
  private scoreField(value: string, query: string, field: string): SearchMatch {
    const normalizedValue = this.options.caseSensitive ? value : value.toLowerCase()
    const boost = this.options.boostFields?.[field] || 1
    
    // Exact match (highest score)
    if (normalizedValue === query) {
      return {
        field,
        value,
        indices: [0, value.length - 1],
        score: 1.0 * boost
      }
    }
    
    // Starts with query (high score)
    if (normalizedValue.startsWith(query)) {
      return {
        field,
        value,
        indices: [0, query.length - 1],
        score: 0.8 * boost
      }
    }
    
    // Contains query (medium score)
    const containsIndex = normalizedValue.indexOf(query)
    if (containsIndex !== -1) {
      return {
        field,
        value,
        indices: [containsIndex, containsIndex + query.length - 1],
        score: 0.6 * boost
      }
    }
    
    // Fuzzy match (lower score)
    if (this.options.fuzzySearch) {
      const fuzzyScore = this.calculateFuzzyScore(normalizedValue, query)
      if (fuzzyScore > 0.3) {
        return {
          field,
          value,
          indices: [],
          score: fuzzyScore * 0.4 * boost
        }
      }
    }
    
    // Word boundary matches
    const words = normalizedValue.split(/\s+/)
    for (const word of words) {
      if (word.startsWith(query)) {
        return {
          field,
          value,
          indices: [],
          score: 0.5 * boost
        }
      }
    }
    
    return {
      field,
      value,
      indices: [],
      score: 0
    }
  }
  
  /**
   * Calculate fuzzy match score using Levenshtein distance
   */
  private calculateFuzzyScore(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length)
    if (maxLength === 0) return 1
    
    const distance = this.levenshteinDistance(str1, str2)
    return (maxLength - distance) / maxLength
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator  // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }
  
  /**
   * Apply filters to search results
   */
  private applyFilters(results: SearchResult<T>[]): SearchResult<T>[] {
    if (!this.options.filters || Object.keys(this.options.filters).length === 0) {
      return results
    }
    
    return results.filter(result => {
      return Object.entries(this.options.filters!).every(([field, filterValue]) => {
        const itemValue = this.getFieldValue(result.item, field)
        
        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue)
        }
        
        if (typeof filterValue === 'object' && filterValue !== null) {
          // Range filter
          if ('min' in filterValue && 'max' in filterValue) {
            const numValue = Number(itemValue)
            return numValue >= (filterValue.min as number) && numValue <= (filterValue.max as number)
          }
        }
        
        return itemValue === filterValue
      })
    })
  }
  
  /**
   * Get searchable fields from data
   */
  private getSearchFields(): string[] {
    if (this.options.searchFields && this.options.searchFields.length > 0) {
      return this.options.searchFields
    }
    
    if (this.data.length === 0) return []
    
    // Auto-detect string fields from first item
    const firstItem = this.data[0]
    return Object.keys(firstItem as Record<string, unknown>).filter(key => {
      const value = (firstItem as Record<string, unknown>)[key]
      return typeof value === 'string'
    })
  }
  
  /**
   * Get field value from item (supports nested fields)
   */
  private getFieldValue(item: T, field: string): string {
    const keys = field.split('.')
    let value: unknown = item
    
    for (const key of keys) {
      value = value?.[key]
      if (value === undefined || value === null) return ''
    }
    
    return String(value)
  }
  
  /**
   * Track search analytics
   */
  private trackSearch(query: string, resultCount: number, searchTime: number): void {
    const analytics: SearchAnalytics = {
      query,
      resultCount,
      searchTime
    }
    
    this.searchAnalytics.push(analytics)
    
    // Track with app analytics
    appAnalytics.trackEvent('search_performed', {
      query: query.length > 50 ? query.substring(0, 50) + '...' : query,
      resultCount,
      searchTime,
      hasResults: resultCount > 0
    })
    
    // Track performance
    appAnalytics.trackPerformance('search_performance', searchTime)
    
    // Track no results
    if (resultCount === 0) {
      appAnalytics.trackEvent('search_no_results', { query })
    }
  }
  
  /**
   * Update search history
   */
  private updateSearchHistory(query: string): void {
    if (!this.searchHistory.includes(query)) {
      this.searchHistory.unshift(query)
      
      // Keep only last 20 searches
      if (this.searchHistory.length > 20) {
        this.searchHistory = this.searchHistory.slice(0, 20)
      }
    }
  }
  
  /**
   * Get search suggestions based on history and popular searches
   */
  getSuggestions(partialQuery: string, limit = 5): string[] {
    const normalizedQuery = partialQuery.toLowerCase()
    
    return this.searchHistory
      .filter(query => query.toLowerCase().includes(normalizedQuery))
      .slice(0, limit)
  }
  
  /**
   * Get search analytics
   */
  getSearchAnalytics(): SearchAnalytics[] {
    return this.searchAnalytics
  }
  
  /**
   * Get popular search terms
   */
  getPopularSearches(limit = 10): Array<{ query: string; count: number }> {
    const queryCount = new Map<string, number>()
    
    this.searchAnalytics.forEach(analytics => {
      const count = queryCount.get(analytics.query) || 0
      queryCount.set(analytics.query, count + 1)
    })
    
    return Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }
  
  /**
   * Update data source
   */
  updateData(newData: T[]): void {
    this.data = newData
  }
  
  /**
   * Update search options
   */
  updateOptions(newOptions: Partial<SearchOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }
  
  /**
   * Clear search history
   */
  clearHistory(): void {
    this.searchHistory = []
    this.searchAnalytics = []
  }
}

/**
 * Hook for advanced search functionality
 */
export const useAdvancedSearch = <T>(
  data: T[],
  options: SearchOptions = {}
) => {
  const [searchState, setSearchState] = useState<SearchState<T>>({
    query: '',
    results: [],
    isSearching: false,
    totalResults: 0,
    searchTime: 0,
    suggestions: [],
    filters: {},
    hasMore: false
  })
  
  const searchEngine = useMemo(() => {
    return new AdvancedSearch(data, options)
  }, [data, options])
  
  const performSearch = useCallback(async (
    query: string,
    filters: Record<string, unknown> = {}
  ) => {
    setSearchState(prev => ({ ...prev, isSearching: true }))
    
    // Simulate async operation for better UX
    setTimeout(() => {
      const searchOptions = { ...options, filters }
      searchEngine.updateOptions(searchOptions)
      
      const startTime = performance.now()
      const results = searchEngine.search(query)
      const searchTime = performance.now() - startTime
      
      const suggestions = searchEngine.getSuggestions(query)
      
      setSearchState(prev => ({
        ...prev,
        query,
        results,
        isSearching: false,
        totalResults: results.length,
        searchTime,
        suggestions,
        filters,
        hasMore: results.length >= (options.maxResults || 50)
      }))
    }, 100)
  }, [searchEngine, options])
  
  const clearSearch = useCallback(() => {
    setSearchState({
      query: '',
      results: [],
      isSearching: false,
      totalResults: 0,
      searchTime: 0,
      suggestions: [],
      filters: {},
      hasMore: false
    })
  }, [])
  
  const trackResultClick = useCallback((resultIndex: number) => {
    appAnalytics.trackEvent('search_result_clicked', {
      query: searchState.query,
      resultIndex,
      totalResults: searchState.totalResults
    })
  }, [searchState.query, searchState.totalResults])
  
  const getPopularSearches = useCallback(() => {
    return searchEngine.getPopularSearches()
  }, [searchEngine])
  
  const getSearchHistory = useCallback(() => {
    return searchEngine.getSearchAnalytics().map(a => a.query)
  }, [searchEngine])
  
  return {
    searchState,
    performSearch,
    clearSearch,
    trackResultClick,
    getPopularSearches,
    getSearchHistory
  }
}

/**
 * Hook for debounced search
 */
export const useDebouncedSearch = <T>(
  data: T[],
  options: SearchOptions = {},
  debounceMs = 300
) => {
  const searchHook = useAdvancedSearch(data, options)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedQuery.trim()) {
        searchHook.performSearch(debouncedQuery)
      } else {
        searchHook.clearSearch()
      }
    }, debounceMs)
    
    return () => clearTimeout(timer)
  }, [debouncedQuery, debounceMs, searchHook])
  
  const setQuery = useCallback((query: string) => {
    setDebouncedQuery(query)
  }, [])
  
  return {
    ...searchHook,
    setQuery
  }
}
