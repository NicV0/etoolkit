import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, unknown>
  timestamp: number
  sessionId: string
  userId?: string
  appVersion?: string
  platform: string
}

export interface UserBehaviorMetrics {
  screenViews: Record<string, number>
  buttonClicks: Record<string, number>
  searchQueries: number
  formSubmissions: Record<string, number>
  errorEncounters: Record<string, number>
  averageSessionDuration: number
  mostUsedFeatures: string[]
}

export interface AppPerformanceMetrics {
  appStartupTime: number
  navigationTransitions: Record<string, number>
  apiResponseTimes: Record<string, number[]>
  renderTimes: Record<string, number[]>
  memoryUsage: number[]
  crashCount: number
  errorRate: number
}

export class AppAnalytics {
  private static instance: AppAnalytics
  private sessionId: string
  private events: AnalyticsEvent[] = []
  private sessionStartTime: number
  private lastInteractionTime: number
  
  private constructor() {
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = Date.now()
    this.lastInteractionTime = Date.now()
    this.initializeSession()
  }
  
  static getInstance(): AppAnalytics {
    if (!AppAnalytics.instance) {
      AppAnalytics.instance = new AppAnalytics()
    }
    return AppAnalytics.instance
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private async initializeSession(): Promise<void> {
    try {
      // Initialize session tracking
      await this.trackEvent('session_start', {
        platform: Platform.OS,
        version: Platform.Version,
        sessionStartTime: this.sessionStartTime
      })
    } catch (error) {
      console.warn('Failed to initialize analytics session:', error)
    }
  }
  
  /**
   * Track a custom event
   */
  async trackEvent(event: string, properties?: Record<string, unknown>): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        event,
        properties: {
          ...properties,
          sessionDuration: Date.now() - this.sessionStartTime
        },
        timestamp: Date.now(),
        sessionId: this.sessionId,
        platform: Platform.OS
      }
      
      this.events.push(analyticsEvent)
      this.lastInteractionTime = Date.now()
      
      // Store events locally for offline capability
      await this.persistEvents()
      
      // Log for development
      if (__DEV__) {
        console.log('📊 Analytics Event:', event, properties)
      }
    } catch (error) {
      console.warn('Failed to track event:', error)
    }
  }
  
  /**
   * Track screen view
   */
  async trackScreenView(screenName: string, params?: Record<string, unknown>): Promise<void> {
    await this.trackEvent('screen_view', {
      screen_name: screenName,
      ...params
    })
  }
  
  /**
   * Track user action
   */
  async trackAction(action: string, target: string, properties?: Record<string, unknown>): Promise<void> {
    await this.trackEvent('user_action', {
      action,
      target,
      ...properties
    })
  }
  
  /**
   * Track performance metric
   */
  async trackPerformance(metric: string, value: number, unit: string = 'ms'): Promise<void> {
    await this.trackEvent('performance_metric', {
      metric,
      value,
      unit,
      timestamp: Date.now()
    })
  }
  
  /**
   * Track error occurrence
   */
  async trackError(error: Error, context?: string): Promise<void> {
    await this.trackEvent('error_encountered', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      error_name: error.name
    })
  }
  
  /**
   * Track API call performance
   */
  async trackAPICall(endpoint: string, method: string, duration: number, success: boolean): Promise<void> {
    await this.trackEvent('api_call', {
      endpoint,
      method,
      duration,
      success,
      response_time: duration
    })
  }
  
  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime
  }
  
  /**
   * Get time since last interaction
   */
  getTimeSinceLastInteraction(): number {
    return Date.now() - this.lastInteractionTime
  }
  
  /**
   * Check if session is considered active (< 30 minutes idle)
   */
  isSessionActive(): boolean {
    return this.getTimeSinceLastInteraction() < 30 * 60 * 1000 // 30 minutes
  }
  
  /**
   * Get user behavior metrics
   */
  async getUserBehaviorMetrics(): Promise<UserBehaviorMetrics> {
    const events = await this.getStoredEvents()
    
    const screenViews: { [key: string]: number } = {}
    const buttonClicks: { [key: string]: number } = {}
    const formSubmissions: { [key: string]: number } = {}
    const errorEncounters: { [key: string]: number } = {}
    let searchQueries = 0
    
    events.forEach(event => {
      switch (event.event) {
        case 'screen_view': {
          const screenName = (event.properties?.screen_name as string) || 'unknown'
          screenViews[screenName] = (screenViews[screenName] || 0) + 1
          break
        }
        case 'user_action':
          if (event.properties?.action === 'click') {
            const target = (event.properties?.target as string) || 'unknown'
            buttonClicks[target] = (buttonClicks[target] || 0) + 1
          } else if (event.properties?.action === 'search') {
            searchQueries++
          } else if (event.properties?.action === 'submit') {
            const form = (event.properties?.target as string) || 'unknown'
            formSubmissions[form] = (formSubmissions[form] || 0) + 1
          }
          break
        case 'error_encountered': {
          const errorType = (event.properties?.context as string) || 'unknown'
          errorEncounters[errorType] = (errorEncounters[errorType] || 0) + 1
          break
        }
      }
    })
    
    // Calculate most used features
    const featureUsage = { ...screenViews, ...buttonClicks }
    const mostUsedFeatures = Object.entries(featureUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature)
    
    return {
      screenViews,
      buttonClicks,
      searchQueries,
      formSubmissions,
      errorEncounters,
      averageSessionDuration: this.getSessionDuration(),
      mostUsedFeatures
    }
  }
  
  /**
   * Get app performance metrics
   */
  async getAppPerformanceMetrics(): Promise<AppPerformanceMetrics> {
    const events = await this.getStoredEvents()
    
    const apiResponseTimes: { [key: string]: number[] } = {}
    const renderTimes: { [key: string]: number[] } = {}
    const navigationTransitions: { [key: string]: number } = {}
    let appStartupTime = 0
    let crashCount = 0
    let errorCount = 0
    
    events.forEach(event => {
      switch (event.event) {
        case 'performance_metric': {
          const metric = event.properties?.metric
          const value = event.properties?.value
          if (metric === 'app_startup' && value) {
            appStartupTime = Number(value)
          } else if (metric && typeof metric === 'string' && metric.includes('render') && value) {
            if (!renderTimes[metric]) renderTimes[metric] = []
            renderTimes[metric].push(Number(value))
          }
          break
        }
        case 'api_call': {
          const endpoint = (event.properties?.endpoint as string) || 'unknown'
          const duration = event.properties?.duration
          if (duration) {
            if (!apiResponseTimes[endpoint]) apiResponseTimes[endpoint] = []
            apiResponseTimes[endpoint].push(Number(duration))
          }
          break
        }
        case 'screen_view': {
          const transition = `transition_to_${event.properties?.screen_name as string}`
          navigationTransitions[transition] = (navigationTransitions[transition] || 0) + 1
          break
        }
        case 'error_encountered':
          if (event.properties?.context === 'crash') {
            crashCount++
          } else {
            errorCount++
          }
          break
      }
    })
    
    const totalEvents = events.length
    const errorRate = totalEvents > 0 ? errorCount / totalEvents : 0
    
    return {
      appStartupTime,
      navigationTransitions,
      apiResponseTimes,
      renderTimes,
      memoryUsage: [], // Would require native module for actual memory tracking
      crashCount,
      errorRate
    }
  }
  
  /**
   * Persist events to local storage
   */
  private async persistEvents(): Promise<void> {
    try {
      const eventsToStore = this.events.slice(-100) // Keep last 100 events
      await AsyncStorage.setItem('analytics_events', JSON.stringify(eventsToStore))
    } catch (error) {
      console.warn('Failed to persist analytics events:', error)
    }
  }
  
  /**
   * Get stored events from local storage
   */
  private async getStoredEvents(): Promise<AnalyticsEvent[]> {
    try {
      const stored = await AsyncStorage.getItem('analytics_events')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to retrieve stored analytics events:', error)
      return []
    }
  }
  
  /**
   * Clear all stored analytics data
   */
  async clearAnalyticsData(): Promise<void> {
    try {
      this.events = []
      await AsyncStorage.removeItem('analytics_events')
    } catch (error) {
      console.warn('Failed to clear analytics data:', error)
    }
  }
  
  /**
   * Export analytics data for debugging or analysis
   */
  async exportAnalyticsData(): Promise<AnalyticsEvent[]> {
    return await this.getStoredEvents()
  }
}

// Export singleton instance
export const appAnalytics = AppAnalytics.getInstance()

// Helper functions for common tracking scenarios
export const trackScreenView = (screenName: string, params?: Record<string, unknown>) => 
  appAnalytics.trackScreenView(screenName, params)

export const trackButtonClick = (buttonName: string, context?: string) =>
  appAnalytics.trackAction('click', buttonName, { context })

export const trackFormSubmission = (formName: string, success: boolean) =>
  appAnalytics.trackAction('submit', formName, { success })

export const trackSearch = (query: string, results: number) =>
  appAnalytics.trackAction('search', 'search_box', { query, results })

export const trackPerformance = (metric: string, value: number, unit?: string) =>
  appAnalytics.trackPerformance(metric, value, unit)

export const trackError = (error: Error, context?: string) =>
  appAnalytics.trackError(error, context)

export const trackAPICall = (endpoint: string, method: string, duration: number, success: boolean) =>
  appAnalytics.trackAPICall(endpoint, method, duration, success)
