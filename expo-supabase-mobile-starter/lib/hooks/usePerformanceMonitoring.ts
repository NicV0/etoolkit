import { useEffect, useRef, useCallback, useState } from 'react'
import { InteractionManager, AppState, Platform } from 'react-native'
import { appAnalytics } from '../monitoring/app-analytics'

export interface PerformanceMetrics {
  renderTime: number
  interactionTime: number
  navigationTime: number
  apiResponseTime: number
  memoryUsage: number
  screenLoadTime: number
}

export interface RenderPerformanceData {
  componentName: string
  renderTime: number
  renderCount: number
  averageRenderTime: number
  slowRenders: number
}

/**
 * Hook to monitor component render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  const totalRenderTime = useRef<number>(0)
  const slowRenderCount = useRef<number>(0)
  
  const startRenderTracking = useCallback(() => {
    renderStartTime.current = performance.now()
  }, [])
  
  const endRenderTracking = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current
      renderCount.current += 1
      totalRenderTime.current += renderTime
      
      // Track slow renders (> 16ms for 60fps)
      if (renderTime > 16) {
        slowRenderCount.current += 1
        appAnalytics.trackPerformance(`slow_render_${componentName}`, renderTime)
      }
      
      // Track periodic metrics
      if (renderCount.current % 10 === 0) {
        const averageRenderTime = totalRenderTime.current / renderCount.current
        appAnalytics.trackPerformance(`avg_render_${componentName}`, averageRenderTime)
      }
      
      renderStartTime.current = 0
    }
  }, [componentName])
  
  useEffect(() => {
    startRenderTracking()
    
    return () => {
      endRenderTracking()
    }
  })
  
  const getPerformanceData = useCallback((): RenderPerformanceData => {
    const averageRenderTime = renderCount.current > 0 
      ? totalRenderTime.current / renderCount.current 
      : 0
    
    return {
      componentName,
      renderTime: totalRenderTime.current,
      renderCount: renderCount.current,
      averageRenderTime,
      slowRenders: slowRenderCount.current
    }
  }, [componentName])
  
  return {
    getPerformanceData,
    renderCount: renderCount.current,
    averageRenderTime: renderCount.current > 0 
      ? totalRenderTime.current / renderCount.current 
      : 0
  }
}

/**
 * Hook to monitor navigation performance
 */
export const useNavigationPerformance = () => {
  const navigationStartTime = useRef<number>(0)
  
  const startNavigationTracking = useCallback((routeName: string) => {
    navigationStartTime.current = performance.now()
    appAnalytics.trackEvent('navigation_start', { route: routeName })
  }, [])
  
  const endNavigationTracking = useCallback((routeName: string) => {
    if (navigationStartTime.current > 0) {
      const navigationTime = performance.now() - navigationStartTime.current
      appAnalytics.trackPerformance(`navigation_${routeName}`, navigationTime)
      appAnalytics.trackEvent('navigation_complete', { 
        route: routeName, 
        duration: navigationTime 
      })
      navigationStartTime.current = 0
    }
  }, [])
  
  return {
    startNavigationTracking,
    endNavigationTracking
  }
}

/**
 * Hook to monitor API call performance
 */
export const useAPIPerformance = () => {
  const apiCalls = useRef<Map<string, number>>(new Map())
  
  const startAPICall = useCallback((endpoint: string, method: string) => {
    const callId = `${method}_${endpoint}_${Date.now()}`
    apiCalls.current.set(callId, performance.now())
    return callId
  }, [])
  
  const endAPICall = useCallback((
    callId: string, 
    endpoint: string, 
    method: string, 
    success: boolean,
    statusCode?: number
  ) => {
    const startTime = apiCalls.current.get(callId)
    if (startTime) {
      const duration = performance.now() - startTime
      apiCalls.current.delete(callId)
      
      appAnalytics.trackAPICall(endpoint, method, duration, success)
      appAnalytics.trackEvent('api_call_complete', {
        endpoint,
        method,
        duration,
        success,
        statusCode
      })
      
      // Track slow API calls (> 2 seconds)
      if (duration > 2000) {
        appAnalytics.trackEvent('slow_api_call', {
          endpoint,
          method,
          duration
        })
      }
    }
  }, [])
  
  return {
    startAPICall,
    endAPICall
  }
}

/**
 * Hook to monitor screen loading performance
 */
export const useScreenPerformance = (screenName: string) => {
  const [isLoading, setIsLoading] = useState(true)
  const screenStartTime = useRef<number>(performance.now())
  const interactionStartTime = useRef<number>(0)
  
  useEffect(() => {
    appAnalytics.trackScreenView(screenName)
    
    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      const loadTime = performance.now() - screenStartTime.current
      appAnalytics.trackPerformance(`screen_load_${screenName}`, loadTime)
      
      if (loadTime > 1000) {
        appAnalytics.trackEvent('slow_screen_load', {
          screen: screenName,
          loadTime
        })
      }
      
      setIsLoading(false)
    })
    
    return () => {
      interactionPromise.cancel()
    }
  }, [screenName])
  
  const markInteractionStart = useCallback(() => {
    interactionStartTime.current = performance.now()
  }, [])
  
  const markInteractionEnd = useCallback((interactionType: string) => {
    if (interactionStartTime.current > 0) {
      const interactionTime = performance.now() - interactionStartTime.current
      appAnalytics.trackPerformance(
        `interaction_${screenName}_${interactionType}`, 
        interactionTime
      )
      interactionStartTime.current = 0
    }
  }, [screenName])
  
  return {
    isLoading,
    markInteractionStart,
    markInteractionEnd
  }
}

/**
 * Hook to monitor memory usage (basic estimation)
 */
export const useMemoryMonitoring = () => {
  const [memoryInfo, setMemoryInfo] = useState({
    estimatedUsage: 0,
    jsHeapSize: 0,
    totalMemory: 0
  })
  
  useEffect(() => {
    const checkMemory = () => {
      try {
        // Basic memory estimation using performance API
        if (typeof performance !== 'undefined' && (performance as any).memory) {
          const memory = (performance as any).memory as any
          setMemoryInfo({
            estimatedUsage: Number(memory.usedJSHeapSize) || 0,
            jsHeapSize: Number(memory.totalJSHeapSize) || 0,
            totalMemory: Number(memory.jsHeapSizeLimit) || 0
          })
          
          // Track memory usage
          appAnalytics.trackPerformance('memory_usage', Number(memory.usedJSHeapSize) || 0, 'bytes')
          
          // Alert for high memory usage (> 80% of limit)
          if (memory.usedJSHeapSize && memory.jsHeapSizeLimit) {
            const usagePercentage = (Number(memory.usedJSHeapSize) / Number(memory.jsHeapSizeLimit)) * 100
            if (usagePercentage > 80) {
              appAnalytics.trackEvent('high_memory_usage', {
                usage: Number(memory.usedJSHeapSize),
                limit: Number(memory.jsHeapSizeLimit),
                percentage: usagePercentage
              })
            }
          }
        }
      } catch (error) {
        console.warn('Failed to check memory usage:', error)
      }
    }
    
    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000)
    checkMemory() // Initial check
    
    return () => clearInterval(interval)
  }, [])
  
  return memoryInfo
}

/**
 * Hook to monitor app state changes and performance
 */
export const useAppStatePerformance = () => {
  const appStateStartTime = useRef<number>(performance.now())
  const backgroundTime = useRef<number>(0)
  
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      const currentTime = performance.now()
      
      if (nextAppState === 'background') {
        backgroundTime.current = currentTime
        const foregroundDuration = currentTime - appStateStartTime.current
        appAnalytics.trackEvent('app_background', {
          foregroundDuration
        })
      } else if (nextAppState === 'active') {
        if (backgroundTime.current > 0) {
          const backgroundDuration = currentTime - backgroundTime.current
          appAnalytics.trackEvent('app_foreground', {
            backgroundDuration
          })
          backgroundTime.current = 0
        }
        appStateStartTime.current = currentTime
      }
    }
    
    const subscription = AppState.addEventListener('change', handleAppStateChange)
    
    return () => {
      subscription?.remove()
    }
  }, [])
}

/**
 * Hook to track user interaction performance
 */
export const useInteractionTracking = () => {
  const touchStartTime = useRef<number>(0)
  
  const trackTouchStart = useCallback(() => {
    touchStartTime.current = performance.now()
  }, [])
  
  const trackTouchEnd = useCallback((actionType: string, target: string) => {
    if (touchStartTime.current > 0) {
      const touchDuration = performance.now() - touchStartTime.current
      appAnalytics.trackEvent('user_interaction', {
        actionType,
        target,
        duration: touchDuration,
        platform: Platform.OS
      })
      
      // Track slow interactions (> 100ms touch duration)
      if (touchDuration > 100) {
        appAnalytics.trackEvent('slow_interaction', {
          actionType,
          target,
          duration: touchDuration
        })
      }
      
      touchStartTime.current = 0
    }
  }, [])
  
  return {
    trackTouchStart,
    trackTouchEnd
  }
}

/**
 * Hook to monitor scroll performance
 */
export const useScrollPerformance = (listName: string) => {
  const scrollStartTime = useRef<number>(0)
  const scrollMetrics = useRef({
    totalScrolls: 0,
    averageScrollDuration: 0,
    maxScrollSpeed: 0
  })
  
  const startScrollTracking = useCallback(() => {
    scrollStartTime.current = performance.now()
  }, [])
  
  const endScrollTracking = useCallback((scrollDistance: number) => {
    if (scrollStartTime.current > 0) {
      const scrollDuration = performance.now() - scrollStartTime.current
      const scrollSpeed = scrollDistance / scrollDuration
      
      scrollMetrics.current.totalScrolls += 1
      scrollMetrics.current.averageScrollDuration = 
        (scrollMetrics.current.averageScrollDuration + scrollDuration) / 2
      scrollMetrics.current.maxScrollSpeed = 
        Math.max(scrollMetrics.current.maxScrollSpeed, scrollSpeed)
      
      appAnalytics.trackPerformance(`scroll_${listName}`, scrollDuration)
      
      // Track performance issues
      if (scrollDuration > 500) {
        appAnalytics.trackEvent('slow_scroll', {
          listName,
          duration: scrollDuration,
          distance: scrollDistance
        })
      }
      
      scrollStartTime.current = 0
    }
  }, [listName])
  
  return {
    startScrollTracking,
    endScrollTracking,
    getScrollMetrics: () => scrollMetrics.current
  }
}

/**
 * Comprehensive performance monitoring hook
 */
export const usePerformanceMonitoring = (componentName: string) => {
  const renderPerf = useRenderPerformance(componentName)
  const navigationPerf = useNavigationPerformance()
  const apiPerf = useAPIPerformance()
  const screenPerf = useScreenPerformance(componentName)
  const memoryInfo = useMemoryMonitoring()
  const interactionTracking = useInteractionTracking()
  
  // Setup app state monitoring
  useAppStatePerformance()
  
  return {
    // Render performance
    ...renderPerf,
    
    // Navigation performance
    ...navigationPerf,
    
    // API performance
    ...apiPerf,
    
    // Screen performance
    ...screenPerf,
    
    // Memory monitoring
    memoryInfo,
    
    // Interaction tracking
    ...interactionTracking,
    
    // Utility to get all performance data
    getAllPerformanceData: () => ({
      render: renderPerf.getPerformanceData(),
      memory: memoryInfo,
      componentName
    })
  }
}
