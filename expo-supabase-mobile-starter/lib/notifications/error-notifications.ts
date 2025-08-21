import { Alert, ToastAndroid, Platform } from 'react-native'
import { APIError } from '../error-handling'

export interface NotificationConfig {
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  showAlert?: boolean
  showToast?: boolean
}

export interface ErrorNotificationConfig extends NotificationConfig {
  error: APIError
  operation?: string
  entity?: string
  retryAction?: () => void
}

export class ErrorNotificationManager {
  private static instance: ErrorNotificationManager
  private notificationQueue: NotificationConfig[] = []
  private isProcessing = false

  static getInstance(): ErrorNotificationManager {
    if (!ErrorNotificationManager.instance) {
      ErrorNotificationManager.instance = new ErrorNotificationManager()
    }
    return ErrorNotificationManager.instance
  }

  /**
   * Show error notification with appropriate UI based on platform
   */
  static showError(config: ErrorNotificationConfig): void {
    const manager = ErrorNotificationManager.getInstance()
    manager.showErrorNotification(config)
  }

  /**
   * Show success notification
   */
  static showSuccess(config: Omit<NotificationConfig, 'type'>): void {
    const manager = ErrorNotificationManager.getInstance()
    manager.showNotification({
      ...config,
      type: 'success'
    })
  }

  /**
   * Show warning notification
   */
  static showWarning(config: Omit<NotificationConfig, 'type'>): void {
    const manager = ErrorNotificationManager.getInstance()
    manager.showNotification({
      ...config,
      type: 'warning'
    })
  }

  /**
   * Show info notification
   */
  static showInfo(config: Omit<NotificationConfig, 'type'>): void {
    const manager = ErrorNotificationManager.getInstance()
    manager.showNotification({
      ...config,
      type: 'info'
    })
  }

  /**
   * Show notification with retry option
   */
  static showErrorWithRetry(
    error: APIError,
    operation: string,
    retryAction: () => void
  ): void {
    const config: ErrorNotificationConfig = {
      error,
      operation,
      message: this.formatErrorMessage(error, operation),
      type: 'error',
      showAlert: true,
      retryAction
    }

    this.showError(config)
  }

  /**
   * Format error message for user display
   */
  private static formatErrorMessage(error: APIError, operation?: string): string {
    const operationText = operation ? ` during ${operation}` : ''
    
    // Handle specific error types
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return `Please check your input and try again${operationText}.`
      
      case 'NOT_FOUND':
        return `The requested item was not found${operationText}.`
      
      case 'UNAUTHORIZED':
        return `You don't have permission to perform this action${operationText}.`
      
      case 'FORBIDDEN':
        return `Access denied${operationText}.`
      
      case 'CONFLICT':
        return `This action conflicts with existing data${operationText}.`
      
      case 'RATE_LIMITED':
        return `Too many requests. Please wait a moment and try again${operationText}.`
      
      case 'NETWORK_ERROR':
        return `Network connection error${operationText}. Please check your internet connection.`
      
      case 'STORAGE_ERROR':
        return `File storage error${operationText}. Please try again.`
      
      case 'DATABASE_ERROR':
        return `Database error${operationText}. Please try again later.`
      
      case 'FILE_ERROR':
        return `File operation failed${operationText}. Please check the file and try again.`
      
      case 'BUSINESS_LOGIC_ERROR':
        return error.message || `Operation failed${operationText}.`
      
      default:
        return error.message || `An unexpected error occurred${operationText}.`
    }
  }

  /**
   * Show error notification with platform-specific UI
   */
  private showErrorNotification(config: ErrorNotificationConfig): void {
    const { error, operation, retryAction, showAlert = true, showToast = true } = config
    
    const message = ErrorNotificationManager.formatErrorMessage(error, operation)
    const title = config.title || this.getErrorTitle(error.code)

    // Show platform-specific notification
    if (Platform.OS === 'android' && showToast) {
      this.showAndroidToast(message, 'error')
    }

    if (showAlert) {
      this.showAlert(title, message, retryAction)
    }

    // Add to queue for processing
    this.notificationQueue.push({
      title,
      message,
      type: 'error',
      duration: config.duration || 5000
    })

    this.processQueue()
  }

  /**
   * Show general notification
   */
  private showNotification(config: NotificationConfig): void {
    const { title, message, type, showAlert = false, showToast = true } = config

    // Show platform-specific notification
    if (Platform.OS === 'android' && showToast) {
      this.showAndroidToast(message, type)
    }

    if (showAlert) {
      this.showAlert(title, message)
    }

    // Add to queue for processing
    this.notificationQueue.push({
      title,
      message,
      type,
      duration: config.duration || 3000
    })

    this.processQueue()
  }

  /**
   * Show Android toast notification
   */
  private showAndroidToast(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
    }
  }

  /**
   * Show alert dialog with optional retry action
   */
  private showAlert(title: string, message: string, retryAction?: () => void): void {
    const buttons = retryAction 
      ? [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: retryAction }
        ]
      : [{ text: 'OK', style: 'default' }]

    Alert.alert(title, message, buttons)
  }

  /**
   * Get error title based on error code
   */
  private getErrorTitle(errorCode?: string): string {
    switch (errorCode) {
      case 'VALIDATION_ERROR':
        return 'Validation Error'
      case 'NOT_FOUND':
        return 'Not Found'
      case 'UNAUTHORIZED':
        return 'Unauthorized'
      case 'FORBIDDEN':
        return 'Access Denied'
      case 'CONFLICT':
        return 'Conflict'
      case 'RATE_LIMITED':
        return 'Rate Limited'
      case 'NETWORK_ERROR':
        return 'Network Error'
      case 'STORAGE_ERROR':
        return 'Storage Error'
      case 'DATABASE_ERROR':
        return 'Database Error'
      case 'FILE_ERROR':
        return 'File Error'
      case 'BUSINESS_LOGIC_ERROR':
        return 'Operation Failed'
      default:
        return 'Error'
    }
  }

  /**
   * Process notification queue
   */
  private processQueue(): void {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return
    }

    this.isProcessing = true

    const processNext = () => {
      if (this.notificationQueue.length === 0) {
        this.isProcessing = false
        return
      }

      const notification = this.notificationQueue.shift()!
      
      // Process notification (could be extended for custom UI components)
      console.log(`[${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}`)

      // Schedule next notification
      setTimeout(processNext, notification.duration)
    }

    processNext()
  }

  /**
   * Clear all pending notifications
   */
  static clearQueue(): void {
    const manager = ErrorNotificationManager.getInstance()
    manager.notificationQueue = []
    manager.isProcessing = false
  }
}

// Convenience functions for common error scenarios
export const ErrorNotifications = {
  /**
   * Show validation error
   */
  showValidationError: (field: string, message: string) => {
    ErrorNotificationManager.showError({
      error: {
        message: `${field}: ${message}`,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      },
      message: `Please check ${field.toLowerCase()} and try again.`,
      type: 'error'
    })
  },

  /**
   * Show network error with retry
   */
  showNetworkError: (operation: string, retryAction: () => void) => {
    ErrorNotificationManager.showErrorWithRetry(
      {
        message: 'Network connection error',
        code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString()
      },
      operation,
      retryAction
    )
  },

  /**
   * Show file upload error
   */
  showFileUploadError: (error: string) => {
    ErrorNotificationManager.showError({
      error: {
        message: error,
        code: 'FILE_ERROR',
        timestamp: new Date().toISOString()
      },
      message: 'File upload failed. Please try again.',
      type: 'error'
    })
  },

  /**
   * Show permission error
   */
  showPermissionError: (operation: string) => {
    ErrorNotificationManager.showError({
      error: {
        message: 'Permission denied',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      },
      operation,
      message: `You don't have permission to ${operation}.`,
      type: 'error'
    })
  },

  /**
   * Show success message
   */
  showSuccess: (message: string, title?: string) => {
    ErrorNotificationManager.showSuccess({
      title: title || 'Success',
      message
    })
  },

  /**
   * Show warning message
   */
  showWarning: (message: string, title?: string) => {
    ErrorNotificationManager.showWarning({
      title: title || 'Warning',
      message
    })
  }
}

// Export the manager instance for direct access
export const errorNotificationManager = ErrorNotificationManager.getInstance()
