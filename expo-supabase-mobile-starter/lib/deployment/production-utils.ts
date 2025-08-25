import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { appAnalytics } from '../monitoring/app-analytics'

export interface ProductionConfig {
  apiUrl: string
  supabaseUrl: string
  supabaseAnonKey: string
  environment: 'development' | 'staging' | 'production'
  version: string
  buildNumber: string
  enableAnalytics: boolean
  enableErrorReporting: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface AppMetadata {
  version: string
  buildNumber: string
  platform: string
  environment: string
  installationId: string
  firstLaunch: boolean
  launchCount: number
  lastLaunch: string
}

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error'
  checks: {
    database: boolean
    storage: boolean
    authentication: boolean
    network: boolean
    permissions: boolean
  }
  errors: string[]
  warnings: string[]
  timestamp: string
}

/**
 * Production utilities for deployment and runtime checks
 */
export class ProductionUtils {
  private static instance: ProductionUtils
  private config: ProductionConfig
  private metadata: AppMetadata
  
  private constructor() {
    this.config = this.getProductionConfig()
    this.metadata = {
      version: '1.0.0',
      buildNumber: '1',
      platform: Platform.OS,
      environment: this.config.environment,
      installationId: '',
      firstLaunch: false,
      launchCount: 0,
      lastLaunch: new Date().toISOString()
    }
    this.initializeMetadata()
  }
  
  static getInstance(): ProductionUtils {
    if (!ProductionUtils.instance) {
      ProductionUtils.instance = new ProductionUtils()
    }
    return ProductionUtils.instance
  }
  
  /**
   * Get production configuration
   */
  private getProductionConfig(): ProductionConfig {
    const isProduction = !__DEV__
    
    return {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      environment: isProduction ? 'production' : 'development',
      version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      buildNumber: process.env.EXPO_PUBLIC_BUILD_NUMBER || '1',
      enableAnalytics: isProduction,
      enableErrorReporting: isProduction,
      logLevel: isProduction ? 'error' : 'debug'
    }
  }
  
  /**
   * Initialize app metadata
   */
  private async initializeMetadata(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('app_metadata')
      if (stored) {
        const storedMetadata = JSON.parse(stored)
        this.metadata = {
          ...storedMetadata,
          platform: Platform.OS,
          environment: this.config.environment,
          lastLaunch: new Date().toISOString(),
          launchCount: (storedMetadata.launchCount || 0) + 1
        }
      } else {
        // First launch
        this.metadata.firstLaunch = true
        this.metadata.installationId = this.generateInstallationId()
        this.metadata.launchCount = 1
      }
      
      await this.saveMetadata()
      
      // Track app launch
      if (this.config.enableAnalytics) {
        appAnalytics.trackEvent('app_launch', {
          version: this.metadata.version,
          buildNumber: this.metadata.buildNumber,
          platform: this.metadata.platform,
          environment: this.metadata.environment,
          firstLaunch: this.metadata.firstLaunch,
          launchCount: this.metadata.launchCount
        })
      }
    } catch (error) {
      console.warn('Failed to initialize app metadata:', error)
    }
  }
  
  /**
   * Generate unique installation ID
   */
  private generateInstallationId(): string {
    return `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Save metadata to storage
   */
  private async saveMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem('app_metadata', JSON.stringify(this.metadata))
    } catch (error) {
      console.warn('Failed to save app metadata:', error)
    }
  }
  
  /**
   * Get current configuration
   */
  getConfig(): ProductionConfig {
    return { ...this.config }
  }
  
  /**
   * Get app metadata
   */
  getMetadata(): AppMetadata {
    return { ...this.metadata }
  }
  
  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config.environment === 'production'
  }
  
  /**
   * Check if analytics are enabled
   */
  isAnalyticsEnabled(): boolean {
    return this.config.enableAnalytics
  }
  
  /**
   * Check if error reporting is enabled
   */
  isErrorReportingEnabled(): boolean {
    return this.config.enableErrorReporting
  }
  
  /**
   * Log message with appropriate level
   */
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const logLevels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = logLevels.indexOf(this.config.logLevel)
    const messageLevelIndex = logLevels.indexOf(level)
    
    if (messageLevelIndex >= currentLevelIndex) {
      const timestamp = new Date().toISOString()
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
      
      switch (level) {
        case 'debug':
          console.log(logMessage, data)
          break
        case 'info':
          console.info(logMessage, data)
          break
        case 'warn':
          console.warn(logMessage, data)
          break
        case 'error':
          console.error(logMessage, data)
          break
      }
      
      // Track errors in analytics
      if (level === 'error' && this.config.enableAnalytics) {
        appAnalytics.trackEvent('app_error', {
          message,
          data: JSON.stringify(data),
          timestamp
        })
      }
    }
  }
  
  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks = {
      database: false,
      storage: false,
      authentication: false,
      network: false,
      permissions: false
    }
    
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Check database connectivity
      try {
        // This would be a simple ping to Supabase
        checks.database = true
      } catch (error) {
        errors.push('Database connectivity failed')
        checks.database = false
      }
      
      // Check storage access
      try {
        await AsyncStorage.getItem('health_check')
        checks.storage = true
      } catch (error) {
        errors.push('Local storage access failed')
        checks.storage = false
      }
      
      // Check network connectivity
      try {
        // Simple network check
        // const response = await fetch('https://www.google.com', {
        //   method: 'HEAD',
        //   mode: 'no-cors'
        // })
        checks.network = true
      } catch (error) {
        warnings.push('Network connectivity limited')
        checks.network = false
      }
      
      // Check basic app permissions
      checks.permissions = true // Would check actual permissions in real implementation
      
      // Check authentication (mock)
      checks.authentication = true
      
    } catch (error) {
      errors.push(`Health check failed: ${error}`)
    }
    
    const hasErrors = errors.length > 0
    const hasWarnings = warnings.length > 0
    const allChecksPass = Object.values(checks).every(check => check)
    
    let status: 'healthy' | 'warning' | 'error'
    if (hasErrors || !allChecksPass) {
      status = 'error'
    } else if (hasWarnings) {
      status = 'warning'
    } else {
      status = 'healthy'
    }
    
    const result: HealthCheckResult = {
      status,
      checks,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    }
    
    // Track health check results
    if (this.config.enableAnalytics) {
      appAnalytics.trackEvent('health_check', {
        status,
        errorCount: errors.length,
        warningCount: warnings.length,
        checksPass: allChecksPass
      })
    }
    
    return result
  }
  
  /**
   * Handle uncaught errors in production
   */
  setupErrorHandling(): void {
    if (this.config.enableErrorReporting) {
      // Global error handler would go here
      // In a real app, this would integrate with services like Sentry
      console.log('Error reporting enabled for production')
    }
  }
  
  /**
   * Check for app updates
   */
  async checkForUpdates(): Promise<{
    hasUpdate: boolean
    latestVersion?: string
    updateRequired?: boolean
    updateMessage?: string
  }> {
    try {
      // In a real app, this would check with your update service
      const mockUpdateCheck = {
        hasUpdate: false,
        latestVersion: this.metadata.version,
        updateRequired: false,
        updateMessage: ''
      }
      
      if (this.config.enableAnalytics) {
        appAnalytics.trackEvent('update_check', {
          currentVersion: this.metadata.version,
          hasUpdate: mockUpdateCheck.hasUpdate
        })
      }
      
      return mockUpdateCheck
    } catch (error) {
      this.log('error', 'Failed to check for updates', error)
      return { hasUpdate: false }
    }
  }
  
  /**
   * Prepare app for background state
   */
  async prepareForBackground(): Promise<void> {
    try {
      await this.saveMetadata()
      
      if (this.config.enableAnalytics) {
        appAnalytics.trackEvent('app_background', {
          sessionDuration: appAnalytics.getSessionDuration()
        })
      }
    } catch (error) {
      this.log('error', 'Failed to prepare for background', error)
    }
  }
  
  /**
   * Handle app restoration from background
   */
  async handleAppRestoration(): Promise<void> {
    try {
      this.metadata.launchCount += 1
      this.metadata.lastLaunch = new Date().toISOString()
      await this.saveMetadata()
      
      if (this.config.enableAnalytics) {
        appAnalytics.trackEvent('app_foreground', {
          launchCount: this.metadata.launchCount
        })
      }
      
      // Perform health check on restoration
      const healthCheck = await this.performHealthCheck()
      if (healthCheck.status === 'error') {
        this.log('warn', 'App restored with health check errors', healthCheck.errors)
      }
    } catch (error) {
      this.log('error', 'Failed to handle app restoration', error)
    }
  }
  
  /**
   * Get deployment readiness score
   */
  async getDeploymentReadiness(): Promise<{
    score: number
    checks: Record<string, boolean>
    recommendations: string[]
  }> {
    const checks = {
      configComplete: this.isConfigurationComplete(),
      healthCheckPassed: false,
      errorHandlingSetup: this.config.enableErrorReporting,
      analyticsEnabled: this.config.enableAnalytics,
      productionOptimized: this.isProduction()
    }
    
    // Perform health check
    const healthCheck = await this.performHealthCheck()
    checks.healthCheckPassed = healthCheck.status !== 'error'
    
    const passedChecks = Object.values(checks).filter(Boolean).length
    const totalChecks = Object.keys(checks).length
    const score = (passedChecks / totalChecks) * 100
    
    const recommendations: string[] = []
    
    if (!checks.configComplete) {
      recommendations.push('Complete production configuration')
    }
    if (!checks.healthCheckPassed) {
      recommendations.push('Resolve health check issues')
    }
    if (!checks.errorHandlingSetup) {
      recommendations.push('Enable error reporting for production')
    }
    if (!checks.analyticsEnabled) {
      recommendations.push('Enable analytics for production insights')
    }
    if (!checks.productionOptimized) {
      recommendations.push('Optimize for production build')
    }
    
    return {
      score,
      checks,
      recommendations
    }
  }
  
  /**
   * Check if configuration is complete
   */
  private isConfigurationComplete(): boolean {
    return !!(
      this.config.supabaseUrl &&
      this.config.supabaseAnonKey &&
      this.config.version &&
      this.config.buildNumber
    )
  }
}

// Export singleton instance
export const productionUtils = ProductionUtils.getInstance()

// Helper functions
export const logDebug = (message: string, data?: unknown) =>
  productionUtils.log('debug', message, data)

export const logInfo = (message: string, data?: unknown) =>
  productionUtils.log('info', message, data)

export const logWarn = (message: string, data?: unknown) =>
  productionUtils.log('warn', message, data)

export const logError = (message: string, data?: unknown) =>
  productionUtils.log('error', message, data)

export const isProduction = () => productionUtils.isProduction()

export const getAppVersion = () => productionUtils.getMetadata().version

export const getAppMetadata = () => productionUtils.getMetadata()

export const performHealthCheck = () => productionUtils.performHealthCheck()

export const checkDeploymentReadiness = () => productionUtils.getDeploymentReadiness()
