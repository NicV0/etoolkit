import { Platform } from 'react-native'
import NetInfo from '@react-native-community/netinfo'

export interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: string
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface PerformanceConfig {
  enabled: boolean
  sampleRate: number // 0.0 to 1.0
  maxMetrics: number
  flushInterval: number // milliseconds
  enableNetworkMonitoring: boolean
  enableMemoryMonitoring: boolean
  enableErrorTracking: boolean
}

export interface NetworkMetrics {
  isConnected: boolean
  type: string
  strength?: number
  latency?: number
}

export interface MemoryMetrics {
  usedMemory: number
  totalMemory: number
  memoryUsage: number // percentage
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private config: PerformanceConfig
  private flushTimer?: NodeJS.Timeout
  private networkMetrics: NetworkMetrics | null = null
  private memoryMetrics: MemoryMetrics | null = null

  private constructor() {
    this.config = {
      enabled: true,
      sampleRate: 1.0, // 100% sampling
      maxMetrics: 1000,
      flushInterval: 60000, // 1 minute
      enableNetworkMonitoring: true,
      enableMemoryMonitoring: true,
      enableErrorTracking: true
    }

    this.initialize()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Initialize performance monitoring
   */
  private async initialize(): Promise<void> {
    if (!this.config.enabled) return

    // Start network monitoring
    if (this.config.enableNetworkMonitoring) {
      this.startNetworkMonitoring()
    }

    // Start memory monitoring
    if (this.config.enableMemoryMonitoring) {
      this.startMemoryMonitoring()
    }

    // Start flush timer
    this.startFlushTimer()
  }

  /**
   * Configure performance monitoring
   */
  static configure(config: Partial<PerformanceConfig>): void {
    const monitor = PerformanceMonitor.getInstance()
    monitor.config = { ...monitor.config, ...config }
    
    // Reinitialize if needed
    if (monitor.config.enabled) {
      monitor.initialize()
    }
  }

  /**
   * Measure operation performance
   */
  static async measure<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const monitor = PerformanceMonitor.getInstance()
    
    if (!monitor.config.enabled || Math.random() > monitor.config.sampleRate) {
      return fn()
    }

    const startTime = performance.now()
    const timestamp = new Date().toISOString()

    try {
      const result = await fn()
      const duration = performance.now() - startTime

      monitor.recordMetric({
        operation,
        duration,
        timestamp,
        success: true,
        metadata
      })

      return result
    } catch (error) {
      const duration = performance.now() - startTime

      monitor.recordMetric({
        operation,
        duration,
        timestamp,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata
      })

      throw error
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    if (!this.config.enabled) return

    this.metrics.push(metric)

    // Limit metrics array size
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics)
    }

    // Log slow operations
    if (metric.duration > 1000) { // 1 second threshold
      console.warn(`Slow operation detected: ${metric.operation} took ${metric.duration.toFixed(2)}ms`)
    }

    // Log errors
    if (!metric.success && this.config.enableErrorTracking) {
      console.error(`Performance error: ${metric.operation} failed after ${metric.duration.toFixed(2)}ms`, metric.error)
    }
  }

  /**
   * Start network monitoring
   */
  private startNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      this.networkMetrics = {
        isConnected: state.isConnected ?? false,
        type: state.type,
        strength: state.details?.strength,
        latency: state.details?.isConnectionExpensive ? 1000 : 100 // Mock latency
      }
    })
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    // Memory monitoring is limited on React Native
    // This is a simplified implementation
    setInterval(() => {
      // Mock memory usage (in a real app, you'd use native modules)
      const usedMemory = Math.random() * 100
      const totalMemory = 100
      
      this.memoryMetrics = {
        usedMemory,
        totalMemory,
        memoryUsage: (usedMemory / totalMemory) * 100
      }

      // Log high memory usage
      if (this.memoryMetrics.memoryUsage > 80) {
        console.warn(`High memory usage detected: ${this.memoryMetrics.memoryUsage.toFixed(1)}%`)
      }
    }, 30000) // Check every 30 seconds
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flushMetrics()
    }, this.config.flushInterval)
  }

  /**
   * Flush metrics to storage/analytics
   */
  private flushMetrics(): void {
    if (this.metrics.length === 0) return

    const metricsToFlush = [...this.metrics]
    this.metrics = []

    // In a real app, you'd send these to your analytics service
    console.log(`Flushing ${metricsToFlush.length} performance metrics`)
    
    // Calculate summary statistics
    const summary = this.calculateSummary(metricsToFlush)
    console.log('Performance Summary:', summary)

    // Store metrics locally for debugging
    this.storeMetricsLocally(metricsToFlush)
  }

  /**
   * Calculate performance summary
   */
  private calculateSummary(metrics: PerformanceMetric[]): Record<string, any> {
    const successfulMetrics = metrics.filter(m => m.success)
    const failedMetrics = metrics.filter(m => !m.success)

    const durations = successfulMetrics.map(m => m.duration)
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0

    return {
      totalOperations: metrics.length,
      successfulOperations: successfulMetrics.length,
      failedOperations: failedMetrics.length,
      successRate: (successfulMetrics.length / metrics.length) * 100,
      averageDuration: avgDuration,
      maxDuration,
      minDuration,
      networkMetrics: this.networkMetrics,
      memoryMetrics: this.memoryMetrics,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Store metrics locally for debugging
   */
  private storeMetricsLocally(metrics: PerformanceMetric[]): void {
    // In a real app, you'd store these in AsyncStorage or a local database
    // For now, we'll just log them
    if (__DEV__) {
      console.log('Performance Metrics:', metrics)
    }
  }

  /**
   * Get current performance metrics
   */
  static getMetrics(): PerformanceMetric[] {
    const monitor = PerformanceMonitor.getInstance()
    return [...monitor.metrics]
  }

  /**
   * Get performance summary
   */
  static getSummary(): Record<string, any> {
    const monitor = PerformanceMonitor.getInstance()
    return monitor.calculateSummary(monitor.metrics)
  }

  /**
   * Get network metrics
   */
  static getNetworkMetrics(): NetworkMetrics | null {
    const monitor = PerformanceMonitor.getInstance()
    return monitor.networkMetrics
  }

  /**
   * Get memory metrics
   */
  static getMemoryMetrics(): MemoryMetrics | null {
    const monitor = PerformanceMonitor.getInstance()
    return monitor.memoryMetrics
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    const monitor = PerformanceMonitor.getInstance()
    monitor.metrics = []
  }

  /**
   * Enable/disable performance monitoring
   */
  static setEnabled(enabled: boolean): void {
    const monitor = PerformanceMonitor.getInstance()
    monitor.config.enabled = enabled
    
    if (enabled) {
      monitor.initialize()
    } else {
      if (monitor.flushTimer) {
        clearInterval(monitor.flushTimer)
      }
    }
  }

  /**
   * Force flush metrics
   */
  static flush(): void {
    const monitor = PerformanceMonitor.getInstance()
    monitor.flushMetrics()
  }
}

// Convenience functions for common performance measurements
export const PerformanceUtils = {
  /**
   * Measure API call performance
   */
  measureAPICall: <T>(
    apiName: string,
    fn: () => Promise<T>,
    additionalMetadata?: Record<string, any>
  ): Promise<T> => {
    return PerformanceMonitor.measure(
      `api_call_${apiName}`,
      fn,
      {
        type: 'api_call',
        platform: Platform.OS,
        ...additionalMetadata
      }
    )
  },

  /**
   * Measure database operation performance
   */
  measureDatabaseOperation: <T>(
    operation: string,
    fn: () => Promise<T>,
    additionalMetadata?: Record<string, any>
  ): Promise<T> => {
    return PerformanceMonitor.measure(
      `database_${operation}`,
      fn,
      {
        type: 'database_operation',
        platform: Platform.OS,
        ...additionalMetadata
      }
    )
  },

  /**
   * Measure file operation performance
   */
  measureFileOperation: <T>(
    operation: string,
    fn: () => Promise<T>,
    additionalMetadata?: Record<string, any>
  ): Promise<T> => {
    return PerformanceMonitor.measure(
      `file_${operation}`,
      fn,
      {
        type: 'file_operation',
        platform: Platform.OS,
        ...additionalMetadata
      }
    )
  },

  /**
   * Measure UI operation performance
   */
  measureUIOperation: <T>(
    operation: string,
    fn: () => Promise<T>,
    additionalMetadata?: Record<string, any>
  ): Promise<T> => {
    return PerformanceMonitor.measure(
      `ui_${operation}`,
      fn,
      {
        type: 'ui_operation',
        platform: Platform.OS,
        ...additionalMetadata
      }
    )
  }
}

// Export the monitor instance for direct access
export const performanceMonitor = PerformanceMonitor.getInstance()
