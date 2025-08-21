import { supabase } from './supabase'

export interface PaginationOptions {
  page: number
  limit: number
  offset?: number
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface QueryOptions {
  pagination?: PaginationOptions
  filters?: Record<string, any>
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  select?: string[]
}

export class PerformanceOptimizer {
  // Default pagination limits
  static readonly DEFAULT_LIMIT = 50
  static readonly MAX_LIMIT = 200
  static readonly MIN_LIMIT = 1

  // Cache configuration
  static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  static readonly CACHE_MAX_SIZE = 100

  // Debounce configuration
  static readonly DEBOUNCE_DELAY = 300 // 300ms

  /**
   * Apply pagination to a Supabase query
   */
  static applyPagination<T>(
    query: any,
    options: PaginationOptions
  ): any {
    const { page, limit } = options
    const offset = options.offset ?? (page - 1) * limit
    const safeLimit = Math.min(Math.max(limit, this.MIN_LIMIT), this.MAX_LIMIT)
    
    return query
      .range(offset, offset + safeLimit - 1)
      .limit(safeLimit)
  }

  /**
   * Apply filters to a Supabase query
   */
  static applyFilters(query: any, filters: Record<string, any>): any {
    let filteredQuery = query

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          filteredQuery = filteredQuery.in(key, value)
        } else if (typeof value === 'string' && value.includes('%')) {
          filteredQuery = filteredQuery.ilike(key, value)
        } else if (typeof value === 'string') {
          filteredQuery = filteredQuery.eq(key, value)
        } else {
          filteredQuery = filteredQuery.eq(key, value)
        }
      }
    })

    return filteredQuery
  }

  /**
   * Apply sorting to a Supabase query
   */
  static applySorting(query: any, sort?: { field: string; direction: 'asc' | 'desc' }): any {
    if (sort) {
      return query.order(sort.field, { ascending: sort.direction === 'asc' })
    }
    return query
  }

  /**
   * Execute a paginated query with performance optimizations
   */
  static async executePaginatedQuery<T>(
    tableName: string,
    options: QueryOptions,
    orgId: string
  ): Promise<PaginatedResult<T>> {
    const { pagination = { page: 1, limit: this.DEFAULT_LIMIT }, filters = {}, sort, select } = options

    // Build base query
    let query = supabase
      .from(tableName)
      .select(select ? select.join(',') : '*')
      .eq('org_id', orgId)

    // Apply filters
    query = this.applyFilters(query, filters)

    // Apply sorting
    query = this.applySorting(query, sort)

    // Get total count for pagination
    const countQuery = supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
    
    const countQueryWithFilters = this.applyFilters(countQuery, filters)
    const { count } = await countQueryWithFilters

    // Apply pagination
    query = this.applyPagination(query, pagination)

    // Execute query
    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`)
    }

    const total = count || 0
    const totalPages = Math.ceil(total / pagination.limit)

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1
      }
    }
  }

  /**
   * Batch operations for better performance
   */
  static async batchOperation<T>(
    items: T[],
    operation: (item: T) => Promise<any>,
    batchSize: number = 10
  ): Promise<any[]> {
    const results: any[] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map(item => operation(item))
      )
      results.push(...batchResults)
    }
    
    return results
  }

  /**
   * Debounce function for search inputs
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = this.DEBOUNCE_DELAY
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func(...args), delay)
    }
  }

  /**
   * Throttle function for expensive operations
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number = 1000
  ): (...args: Parameters<T>) => void {
    let lastCall = 0
    
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCall >= delay) {
        lastCall = now
        func(...args)
      }
    }
  }

  /**
   * Optimize large dataset queries with cursor-based pagination
   */
  static async cursorPaginatedQuery<T>(
    tableName: string,
    options: {
      orgId: string
      cursor?: string
      limit?: number
      sortField?: string
      filters?: Record<string, any>
    }
  ): Promise<{
    data: T[]
    nextCursor?: string
    hasMore: boolean
  }> {
    const { orgId, cursor, limit = this.DEFAULT_LIMIT, sortField = 'created_at', filters = {} } = options

    let query = supabase
      .from(tableName)
      .select('*')
      .eq('org_id', orgId)
      .order(sortField, { ascending: false })
      .limit(limit + 1) // Get one extra to check if there are more

    // Apply cursor-based pagination
    if (cursor) {
      query = query.lt(sortField, cursor)
    }

    // Apply filters
    query = this.applyFilters(query, filters)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`)
    }

    const hasMore = (data?.length || 0) > limit
    const resultData = data?.slice(0, limit) || []
    const nextCursor = hasMore && resultData.length > 0 
      ? resultData[resultData.length - 1][sortField] 
      : undefined

    return {
      data: resultData,
      nextCursor,
      hasMore
    }
  }

  /**
   * Optimize search queries with full-text search
   */
  static async optimizedSearch<T>(
    tableName: string,
    searchTerm: string,
    searchFields: string[],
    options: QueryOptions,
    orgId: string
  ): Promise<PaginatedResult<T>> {
    const { pagination = { page: 1, limit: this.DEFAULT_LIMIT }, filters = {} } = options

    // Build search query using PostgreSQL full-text search
    const searchQuery = searchFields
      .map(field => `${field}.ilike.%${searchTerm}%`)
      .join(',')

    let query = supabase
      .from(tableName)
      .select('*')
      .eq('org_id', orgId)
      .or(searchQuery)

    // Apply additional filters
    query = this.applyFilters(query, filters)

    // Apply pagination
    query = this.applyPagination(query, pagination)

    const { data, error } = await query

    if (error) {
      throw new Error(`Search failed: ${error.message}`)
    }

    return {
      data: data || [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: data?.length || 0,
        totalPages: Math.ceil((data?.length || 0) / pagination.limit),
        hasNext: false, // Simplified for search results
        hasPrev: pagination.page > 1
      }
    }
  }

  /**
   * Memory-efficient data processing for large datasets
   */
  static async processLargeDataset<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 50
  ): Promise<R[]> {
    const results: R[] = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      // Process batch with memory cleanup
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          const result = await processor(item)
          // Force garbage collection hint (if available)
          if (global.gc) {
            global.gc()
          }
          return result
        })
      )
      
      results.push(...batchResults)
      
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    return results
  }
}

// Export commonly used performance constants
export const PERFORMANCE_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
  SEARCH_DEBOUNCE: 300,
  CACHE_TTL: 5 * 60 * 1000,
  BATCH_SIZE: 10,
  LARGE_DATASET_BATCH_SIZE: 50
} as const
