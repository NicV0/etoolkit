import { 
  PerformanceOptimizer, 
  PERFORMANCE_CONSTANTS,
  type PaginationOptions,
  type QueryOptions,
  // type PaginatedResult // unused
} from '../../lib/performance'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }))
    }))
  }))
}

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('Performance Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PerformanceOptimizer', () => {
    describe('applyPagination', () => {
      it('should apply pagination correctly', () => {
        const mockQuery = {
          range: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }
        
        const options: PaginationOptions = { page: 2, limit: 25, offset: 25 }
        PerformanceOptimizer.applyPagination(mockQuery, options)
        
        expect(mockQuery.range).toHaveBeenCalledWith(25, 49)
        expect(mockQuery.limit).toHaveBeenCalledWith(25)
      })

      it('should handle custom offset', () => {
        const mockQuery = {
          range: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }
        
        const options: PaginationOptions = { page: 1, limit: 10, offset: 50 }
        PerformanceOptimizer.applyPagination(mockQuery, options)
        
        expect(mockQuery.range).toHaveBeenCalledWith(50, 59)
      })

      it('should respect minimum and maximum limits', () => {
        const mockQuery = {
          range: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }
        
        // Test minimum limit
        PerformanceOptimizer.applyPagination(mockQuery, { page: 1, limit: 0, offset: 0 })
        expect(mockQuery.limit).toHaveBeenCalledWith(1)
        
        // Test maximum limit
        PerformanceOptimizer.applyPagination(mockQuery, { page: 1, limit: 1000, offset: 0 })
        expect(mockQuery.limit).toHaveBeenCalledWith(200)
      })
    })

    describe('applyFilters', () => {
      it('should apply filters correctly', () => {
        const mockQuery = {
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis()
        }
        
        const filters = {
          status: 'active',
          category: ['electronics', 'books'],
          name: '%test%'
        }
        
        PerformanceOptimizer.applyFilters(mockQuery, filters)
        
        expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active')
        expect(mockQuery.in).toHaveBeenCalledWith('category', ['electronics', 'books'])
        expect(mockQuery.ilike).toHaveBeenCalledWith('name', '%test%')
      })

      it('should skip undefined, null, and empty filters', () => {
        const mockQuery = {
          eq: jest.fn().mockReturnThis()
        }
        
        const filters = {
          status: undefined,
          category: null,
          name: ''
        }
        
        PerformanceOptimizer.applyFilters(mockQuery, filters)
        
        expect(mockQuery.eq).not.toHaveBeenCalled()
      })
    })

    describe('applySorting', () => {
      it('should apply sorting correctly', () => {
        const mockQuery = {
          order: jest.fn().mockReturnThis()
        }
        
        const sort = { created_at: 'desc' as const }
        PerformanceOptimizer.applySorting(mockQuery, sort)
        
        expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      })

      it('should return query unchanged when no sort provided', () => {
        const mockQuery = { someMethod: jest.fn() }
        const result = PerformanceOptimizer.applySorting(mockQuery)
        
        expect(result).toBe(mockQuery)
      })
    })

    describe('debounce', () => {
      it('should debounce function calls', (done) => {
        jest.useFakeTimers()
        
        const mockFn = jest.fn()
        const debouncedFn = PerformanceOptimizer.debounce(mockFn, 300)
        
        // Call multiple times quickly
        debouncedFn('arg1')
        debouncedFn('arg2')
        debouncedFn('arg3')
        
        expect(mockFn).not.toHaveBeenCalled()
        
        // Fast forward time
        jest.advanceTimersByTime(300)
        
        setTimeout(() => {
          expect(mockFn).toHaveBeenCalledTimes(1)
          expect(mockFn).toHaveBeenCalledWith('arg3')
          done()
        }, 0)
        
        jest.useRealTimers()
      })
    })

    describe('throttle', () => {
      it('should throttle function calls', (done) => {
        jest.useFakeTimers()
        
        const mockFn = jest.fn()
        const throttledFn = PerformanceOptimizer.throttle(mockFn, 1000)
        
        // Call multiple times
        throttledFn('arg1')
        throttledFn('arg2')
        throttledFn('arg3')
        
        expect(mockFn).toHaveBeenCalledTimes(1)
        expect(mockFn).toHaveBeenCalledWith('arg1')
        
        // Fast forward time
        jest.advanceTimersByTime(1000)
        
        throttledFn('arg4')
        
        setTimeout(() => {
          expect(mockFn).toHaveBeenCalledTimes(2)
          expect(mockFn).toHaveBeenCalledWith('arg4')
          done()
        }, 0)
        
        jest.useRealTimers()
      })
    })

    describe('batchOperation', () => {
      it('should process items in batches', async () => {
        const items = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }))
        const operation = jest.fn().mockImplementation((item) => Promise.resolve(`processed_${item.id}`))
        
        const results = await PerformanceOptimizer.batchOperation(items, operation, 10)
        
        expect(operation).toHaveBeenCalledTimes(25)
        expect(results).toHaveLength(25)
        expect(results[0]).toBe('processed_0')
        expect(results[24]).toBe('processed_24')
      })

      it('should handle empty items array', async () => {
        const operation = jest.fn()
        const results = await PerformanceOptimizer.batchOperation([], operation)
        
        expect(operation).not.toHaveBeenCalled()
        expect(results).toEqual([])
      })

      it('should handle single batch', async () => {
        const items = [{ id: 1 }, { id: 2 }]
        const operation = jest.fn().mockImplementation((item) => Promise.resolve(item.id))
        
        const results = await PerformanceOptimizer.batchOperation(items, operation, 5)
        
        expect(results).toEqual([1, 2])
      })
    })

    describe('processLargeDataset', () => {
      it('should process large datasets efficiently', async () => {
        const items = Array.from({ length: 100 }, (_, i) => ({ id: i, data: `data_${i}` }))
        const processor = jest.fn().mockImplementation((item) => Promise.resolve({ ...item, processed: true }))
        
        const results = await PerformanceOptimizer.processLargeDataset(items, processor, 20)
        
        expect(processor).toHaveBeenCalledTimes(100)
        expect(results).toHaveLength(100)
        expect((results[0] as Record<string, unknown>).processed).toBe(true)
        expect((results[99] as Record<string, unknown>).processed).toBe(true)
      })

      it('should handle empty dataset', async () => {
        const processor = jest.fn()
        const results = await PerformanceOptimizer.processLargeDataset([], processor)
        
        expect(processor).not.toHaveBeenCalled()
        expect(results).toEqual([])
      })
    })

    describe('cursorPaginatedQuery', () => {
      it('should handle cursor-based pagination', async () => {
        // const mockData = Array.from({ length: 11 }, (_, i) => ({ // unused
        //   id: i, 
        //   created_at: new Date(Date.now() - i * 1000).toISOString() 
        // }))
        
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lt: jest.fn().mockReturnThis()
        }
        
        // Mock the supabase client
        // const mockSupabaseClient = { // unused
        //   from: jest.fn(() => mockQuery)
        // }
        
        // This would need to be properly mocked in a real test
        await PerformanceOptimizer.cursorPaginatedQuery('test_table', {
          filters: { org_id: 'test-org' },
          limit: 10,
          sort: { created_at: 'desc' }
        })
        
        // Verify the query structure
        expect(mockQuery.select).toHaveBeenCalledWith('*')
        expect(mockQuery.eq).toHaveBeenCalledWith('org_id', 'test-org')
        expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
        expect(mockQuery.limit).toHaveBeenCalledWith(11) // limit + 1
      })
    })

    describe('optimizedSearch', () => {
      it('should perform optimized search', async () => {
        const mockQuery = {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          range: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis()
        }
        
        // const mockSupabaseClient = { // unused
        //   from: jest.fn(() => mockQuery)
        // }
        
        await PerformanceOptimizer.optimizedSearch('test_table', 'search_term', ['name', 'description'], {
          limit: 20
        })
        
        expect(mockQuery.select).toHaveBeenCalledWith('*')
        expect(mockQuery.eq).toHaveBeenCalledWith('org_id', 'test-org')
        expect(mockQuery.or).toHaveBeenCalledWith('name.ilike.%search_term%,description.ilike.%search_term%')
      })
    })
  })

  describe('PERFORMANCE_CONSTANTS', () => {
    it('should have all required constants', () => {
      expect(PERFORMANCE_CONSTANTS.DEFAULT_PAGE_SIZE).toBe(50)
      expect(PERFORMANCE_CONSTANTS.MAX_PAGE_SIZE).toBe(200)
      expect(PERFORMANCE_CONSTANTS.SEARCH_DEBOUNCE).toBe(300)
      expect(PERFORMANCE_CONSTANTS.CACHE_TTL).toBe(5 * 60 * 1000)
      expect(PERFORMANCE_CONSTANTS.BATCH_SIZE).toBe(10)
      expect(PERFORMANCE_CONSTANTS.LARGE_DATASET_BATCH_SIZE).toBe(50)
    })
  })

  describe('Integration Tests', () => {
    it('should handle complex query optimization', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis()
      }
      
      const options: QueryOptions = {
        pagination: { page: 2, limit: 25, offset: 25 },
        filters: { status: 'active', category: ['electronics'] },
        sort: { created_at: 'desc' }
      }
      
      // Apply all optimizations
      // let query = mockQuery // unused
      PerformanceOptimizer.applyFilters(mockQuery, options.filters || {})
      PerformanceOptimizer.applySorting(mockQuery, options.sort)
      PerformanceOptimizer.applyPagination(mockQuery, options.pagination!)
      
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'active')
      expect(mockQuery.in).toHaveBeenCalledWith('category', ['electronics'])
      expect(mockQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockQuery.range).toHaveBeenCalledWith(25, 49)
      expect(mockQuery.limit).toHaveBeenCalledWith(25)
    })

    it('should handle performance with large datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({ 
        id: i, 
        name: `Item ${i}`, 
        category: `Category ${i % 10}` 
      }))
      
      const processor = jest.fn().mockImplementation((item) => 
        Promise.resolve({ ...item, processed: true, timestamp: Date.now() })
      )
      
      const startTime = Date.now()
      const results = await PerformanceOptimizer.processLargeDataset(largeDataset, processor, 50)
      const endTime = Date.now()
      
      expect(results).toHaveLength(1000)
      expect(processor).toHaveBeenCalledTimes(1000)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    
  })
})
