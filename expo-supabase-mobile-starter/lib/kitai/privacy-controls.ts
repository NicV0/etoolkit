import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

export interface PrivacySettings {
  // Data Processing
  allowLocalProcessing: boolean
  allowCloudProcessing: boolean
  allowDataCollection: boolean
  allowAnalytics: boolean
  
  // Data Retention
  dataRetentionDays: number
  autoDeleteOldData: boolean
  
  // Data Anonymization
  anonymizeClientData: boolean
  anonymizeFinancialData: boolean
  anonymizeSearchQueries: boolean
  
  // AI Features
  allowAISuggestions: boolean
  allowAIAnalytics: boolean
  allowAIPersonalization: boolean
  
  // Network
  requireWifiForCloud: boolean
  allowCellularForCloud: boolean
  
  // Security
  encryptLocalData: boolean
  requireBiometricAuth: boolean
}

export interface DataAnonymizationConfig {
  // Client data anonymization
  clientNamePattern: 'full' | 'partial' | 'none'
  clientEmailPattern: 'full' | 'partial' | 'none'
  clientPhonePattern: 'full' | 'partial' | 'none'
  
  // Financial data anonymization
  amountPattern: 'exact' | 'range' | 'none'
  currencyPattern: 'show' | 'hide'
  
  // Search query anonymization
  queryPattern: 'full' | 'partial' | 'none'
  preserveIntent: boolean
}

export interface PrivacyAuditLog {
  timestamp: string
  action: string
  dataType: string
  anonymized: boolean
  localOnly: boolean
  userConsent: boolean
}

export class PrivacyController {
  private static instance: PrivacyController
  private settings: PrivacySettings
  private anonymizationConfig: DataAnonymizationConfig
  private auditLog: PrivacyAuditLog[] = []
  private storageKey = 'etoolkit_privacy_settings'
  private auditKey = 'etoolkit_privacy_audit'

  private constructor() {
    this.settings = this.getDefaultSettings()
    this.anonymizationConfig = this.getDefaultAnonymizationConfig()
    this.loadSettings()
  }

  static getInstance(): PrivacyController {
    if (!PrivacyController.instance) {
      PrivacyController.instance = new PrivacyController()
    }
    return PrivacyController.instance
  }

  /**
   * Get default privacy settings
   */
  private getDefaultSettings(): PrivacySettings {
    return {
      allowLocalProcessing: true,
      allowCloudProcessing: false,
      allowDataCollection: false,
      allowAnalytics: false,
      dataRetentionDays: 30,
      autoDeleteOldData: true,
      anonymizeClientData: true,
      anonymizeFinancialData: true,
      anonymizeSearchQueries: true,
      allowAISuggestions: true,
      allowAIAnalytics: false,
      allowAIPersonalization: false,
      requireWifiForCloud: true,
      allowCellularForCloud: false,
      encryptLocalData: true,
      requireBiometricAuth: false
    }
  }

  /**
   * Get default anonymization configuration
   */
  private getDefaultAnonymizationConfig(): DataAnonymizationConfig {
    return {
      clientNamePattern: 'partial',
      clientEmailPattern: 'partial',
      clientPhonePattern: 'partial',
      amountPattern: 'range',
      currencyPattern: 'show',
      queryPattern: 'partial',
      preserveIntent: true
    }
  }

  /**
   * Load privacy settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const storedSettings = await AsyncStorage.getItem(this.storageKey)
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) }
      }

      const storedAudit = await AsyncStorage.getItem(this.auditKey)
      if (storedAudit) {
        this.auditLog = JSON.parse(storedAudit)
      }
    } catch (error) {
      console.warn('Failed to load privacy settings:', error)
    }
  }

  /**
   * Save privacy settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.settings))
      await AsyncStorage.setItem(this.auditKey, JSON.stringify(this.auditLog))
    } catch (error) {
      console.warn('Failed to save privacy settings:', error)
    }
  }

  /**
   * Get current privacy settings
   */
  static getSettings(): PrivacySettings {
    const controller = PrivacyController.getInstance()
    return { ...controller.settings }
  }

  /**
   * Update privacy settings
   */
  static async updateSettings(updates: Partial<PrivacySettings>): Promise<void> {
    const controller = PrivacyController.getInstance()
    controller.settings = { ...controller.settings, ...updates }
    await controller.saveSettings()
  }

  /**
   * Get anonymization configuration
   */
  static getAnonymizationConfig(): DataAnonymizationConfig {
    const controller = PrivacyController.getInstance()
    return { ...controller.anonymizationConfig }
  }

  /**
   * Update anonymization configuration
   */
  static async updateAnonymizationConfig(updates: Partial<DataAnonymizationConfig>): Promise<void> {
    const controller = PrivacyController.getInstance()
    controller.anonymizationConfig = { ...controller.anonymizationConfig, ...updates }
    await controller.saveSettings()
  }

  /**
   * Check if cloud processing is allowed
   */
  static canUseCloudProcessing(): boolean {
    const settings = PrivacyController.getSettings()
    return settings.allowCloudProcessing
  }

  /**
   * Check if local processing is allowed
   */
  static canUseLocalProcessing(): boolean {
    const settings = PrivacyController.getSettings()
    return settings.allowLocalProcessing
  }

  /**
   * Check if data collection is allowed
   */
  static canCollectData(): boolean {
    const settings = PrivacyController.getSettings()
    return settings.allowDataCollection
  }

  /**
   * Anonymize client data
   */
  static anonymizeClientData(clientData: any): any {
    const config = PrivacyController.getAnonymizationConfig()
    const settings = PrivacyController.getSettings()

    if (!settings.anonymizeClientData) {
      return clientData
    }

    const anonymized = { ...clientData }

    // Anonymize name
    if (anonymized.name) {
      anonymized.name = PrivacyController.anonymizeName(anonymized.name, config.clientNamePattern)
    }

    // Anonymize email
    if (anonymized.email) {
      anonymized.email = PrivacyController.anonymizeEmail(anonymized.email, config.clientEmailPattern)
    }

    // Anonymize phone
    if (anonymized.phone) {
      anonymized.phone = PrivacyController.anonymizePhone(anonymized.phone, config.clientPhonePattern)
    }

    return anonymized
  }

  /**
   * Anonymize financial data
   */
  static anonymizeFinancialData(financialData: any): any {
    const config = PrivacyController.getAnonymizationConfig()
    const settings = PrivacyController.getSettings()

    if (!settings.anonymizeFinancialData) {
      return financialData
    }

    const anonymized = { ...financialData }

    // Anonymize amounts
    if (anonymized.amount || anonymized.total || anonymized.subtotal) {
      if (anonymized.amount) {
        anonymized.amount = PrivacyController.anonymizeAmount(anonymized.amount, config.amountPattern)
      }
      if (anonymized.total) {
        anonymized.total = PrivacyController.anonymizeAmount(anonymized.total, config.amountPattern)
      }
      if (anonymized.subtotal) {
        anonymized.subtotal = PrivacyController.anonymizeAmount(anonymized.subtotal, config.amountPattern)
      }
    }

    // Handle currency
    if (config.currencyPattern === 'hide') {
      delete anonymized.currency
    }

    return anonymized
  }

  /**
   * Anonymize search query
   */
  static anonymizeSearchQuery(query: string): string {
    const config = PrivacyController.getAnonymizationConfig()
    const settings = PrivacyController.getSettings()

    if (!settings.anonymizeSearchQueries) {
      return query
    }

    return PrivacyController.anonymizeQuery(query, config.queryPattern, config.preserveIntent)
  }

  /**
   * Anonymize name based on pattern
   */
  private static anonymizeName(name: string, pattern: 'full' | 'partial' | 'none'): string {
    switch (pattern) {
      case 'full':
        return name.charAt(0) + '*'.repeat(name.length - 1)
      case 'partial':
        const parts = name.split(' ')
        return parts.map(part => part.charAt(0) + '*'.repeat(part.length - 1)).join(' ')
      case 'none':
        return name
      default:
        return name
    }
  }

  /**
   * Anonymize email based on pattern
   */
  private static anonymizeEmail(email: string, pattern: 'full' | 'partial' | 'none'): string {
    switch (pattern) {
      case 'full':
        const [local, domain] = email.split('@')
        return local.charAt(0) + '*'.repeat(local.length - 1) + '@' + domain
      case 'partial':
        const [localPart, domainPart] = email.split('@')
        return localPart.charAt(0) + '***@' + domainPart
      case 'none':
        return email
      default:
        return email
    }
  }

  /**
   * Anonymize phone based on pattern
   */
  private static anonymizePhone(phone: string, pattern: 'full' | 'partial' | 'none'): string {
    switch (pattern) {
      case 'full':
        return phone.replace(/\d/g, '*')
      case 'partial':
        return phone.slice(0, 4) + '*'.repeat(phone.length - 4)
      case 'none':
        return phone
      default:
        return phone
    }
  }

  /**
   * Anonymize amount based on pattern
   */
  private static anonymizeAmount(amount: number, pattern: 'exact' | 'range' | 'none'): number | string {
    switch (pattern) {
      case 'exact':
        return amount
      case 'range':
        if (amount < 100) return '< $100'
        if (amount < 1000) return '$100 - $1,000'
        if (amount < 10000) return '$1,000 - $10,000'
        return '> $10,000'
      case 'none':
        return '***'
      default:
        return amount
    }
  }

  /**
   * Anonymize query based on pattern
   */
  private static anonymizeQuery(query: string, pattern: 'full' | 'partial' | 'none', preserveIntent: boolean): string {
    switch (pattern) {
      case 'full':
        return preserveIntent ? 'search query' : '***'
      case 'partial':
        const words = query.split(' ')
        return words.map(word => word.charAt(0) + '*'.repeat(word.length - 1)).join(' ')
      case 'none':
        return query
      default:
        return query
    }
  }

  /**
   * Log privacy audit event
   */
  static logAuditEvent(action: string, dataType: string, anonymized: boolean, localOnly: boolean): void {
    const controller = PrivacyController.getInstance()
    const settings = PrivacyController.getSettings()

    const auditEntry: PrivacyAuditLog = {
      timestamp: new Date().toISOString(),
      action,
      dataType,
      anonymized,
      localOnly,
      userConsent: settings.allowDataCollection
    }

    controller.auditLog.push(auditEntry)

    // Keep only last 1000 entries
    if (controller.auditLog.length > 1000) {
      controller.auditLog = controller.auditLog.slice(-1000)
    }

    controller.saveSettings()
  }

  /**
   * Get privacy audit log
   */
  static getAuditLog(): PrivacyAuditLog[] {
    const controller = PrivacyController.getInstance()
    return [...controller.auditLog]
  }

  /**
   * Clear privacy audit log
   */
  static async clearAuditLog(): Promise<void> {
    const controller = PrivacyController.getInstance()
    controller.auditLog = []
    await controller.saveSettings()
  }

  /**
   * Export privacy data for user
   */
  static async exportPrivacyData(): Promise<any> {
    const settings = PrivacyController.getSettings()
    const auditLog = PrivacyController.getAuditLog()

    return {
      settings,
      auditLog,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  }

  /**
   * Reset privacy settings to defaults
   */
  static async resetToDefaults(): Promise<void> {
    const controller = PrivacyController.getInstance()
    controller.settings = controller.getDefaultSettings()
    controller.anonymizationConfig = controller.getDefaultAnonymizationConfig()
    controller.auditLog = []
    await controller.saveSettings()
  }

  /**
   * Check if biometric authentication is available
   */
  static async isBiometricAvailable(): Promise<boolean> {
    // This would integrate with expo-local-authentication
    // For now, return false as placeholder
    return false
  }

  /**
   * Validate privacy settings
   */
  static validateSettings(settings: Partial<PrivacySettings>): string[] {
    const errors: string[] = []

    if (settings.dataRetentionDays !== undefined && settings.dataRetentionDays < 1) {
      errors.push('Data retention days must be at least 1')
    }

    if (settings.dataRetentionDays !== undefined && settings.dataRetentionDays > 365) {
      errors.push('Data retention days cannot exceed 365')
    }

    return errors
  }
}

// Convenience functions for common privacy operations
export const PrivacyUtils = {
  /**
   * Check if AI features are enabled
   */
  isAIEnabled: (): boolean => {
    const settings = PrivacyController.getSettings()
    return settings.allowAISuggestions || settings.allowAIAnalytics || settings.allowAIPersonalization
  },

  /**
   * Check if cloud features are enabled
   */
  isCloudEnabled: (): boolean => {
    const settings = PrivacyController.getSettings()
    return settings.allowCloudProcessing
  },

  /**
   * Get privacy summary for user
   */
  getPrivacySummary: (): Record<string, any> => {
    const settings = PrivacyController.getSettings()
    const auditLog = PrivacyController.getAuditLog()

    return {
      localProcessing: settings.allowLocalProcessing,
      cloudProcessing: settings.allowCloudProcessing,
      dataCollection: settings.allowDataCollection,
      anonymization: settings.anonymizeClientData || settings.anonymizeFinancialData,
      auditEvents: auditLog.length,
      lastAuditEvent: auditLog.length > 0 ? auditLog[auditLog.length - 1].timestamp : null
    }
  }
}

// Export the controller instance for direct access
export const privacyController = PrivacyController.getInstance()
