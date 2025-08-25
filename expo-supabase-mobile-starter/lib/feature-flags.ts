import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature flag types
export interface FeatureFlags {
  // UI/UX features
  enable_dark_mode: boolean;
  enable_animations: boolean;
  enable_haptic_feedback: boolean;
  
  // KitAI features
  enable_kitai: boolean;
  enable_kitai_advanced: boolean;
  enable_kitai_file_attachments: boolean;
  
  // Invoice features
  enable_invoice_templates: boolean;
  enable_invoice_customization: boolean;
  enable_bulk_operations: boolean;
  
  // Sync features
  enable_offline_sync: boolean;
  enable_background_sync: boolean;
  enable_conflict_resolution: boolean;
  
  // Security features
  enable_biometric_auth: boolean;
  enable_data_encryption: boolean;
  enable_audit_logging: boolean;
  
  // Performance features
  enable_virtualized_lists: boolean;
  enable_lazy_loading: boolean;
  enable_performance_monitoring: boolean;
  
  // Experimental features
  enable_beta_features: boolean;
  enable_advanced_search: boolean;
  enable_analytics: boolean;
}

// Default feature flags (conservative - most features disabled by default)
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // UI/UX features
  enable_dark_mode: true,
  enable_animations: true,
  enable_haptic_feedback: true,
  
  // KitAI features
  enable_kitai: true,
  enable_kitai_advanced: false,
  enable_kitai_file_attachments: false,
  
  // Invoice features
  enable_invoice_templates: true,
  enable_invoice_customization: true,
  enable_bulk_operations: false,
  
  // Sync features
  enable_offline_sync: true,
  enable_background_sync: true,
  enable_conflict_resolution: true,
  
  // Security features
  enable_biometric_auth: true,
  enable_data_encryption: true,
  enable_audit_logging: true,
  
  // Performance features
  enable_virtualized_lists: true,
  enable_lazy_loading: true,
  enable_performance_monitoring: false,
  
  // Experimental features
  enable_beta_features: false,
  enable_advanced_search: false,
  enable_analytics: false,
};

// Development overrides (can be set in dev builds)
export const DEV_FEATURE_FLAGS: Partial<FeatureFlags> = {
  enable_beta_features: true,
  enable_kitai_advanced: true,
  enable_advanced_search: true,
  enable_analytics: true,
};

// Storage for feature flags
const storage = AsyncStorage;

const FEATURE_FLAGS_KEY = 'feature_flags';
const FEATURE_FLAGS_OVERRIDE_KEY = 'feature_flags_override';

class FeatureFlagManager {
  private flags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
  private overrides: Partial<FeatureFlags> = {};
  private isInitialized = false;

  constructor() {
    this.loadFlags();
  }

  private async loadFlags() {
    try {
      // Load remote flags from storage
      const storedFlags = await storage.getItem(FEATURE_FLAGS_KEY);
      if (storedFlags) {
        this.flags = { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(storedFlags) };
      }

      // Load local overrides
      const storedOverrides = await storage.getItem(FEATURE_FLAGS_OVERRIDE_KEY);
      if (storedOverrides) {
        this.overrides = JSON.parse(storedOverrides);
      }

      // Apply development overrides in dev builds
      if (__DEV__) {
        this.overrides = { ...this.overrides, ...DEV_FEATURE_FLAGS };
      }

      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to load feature flags:', error);
      this.flags = { ...DEFAULT_FEATURE_FLAGS };
    }
  }

  /**
   * Get a feature flag value
   */
  get<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
    if (!this.isInitialized) {
      this.loadFlags();
    }

    // Check for local override first
    if (key in this.overrides) {
      return this.overrides[key] as FeatureFlags[K];
    }

    // Return the flag value
    return this.flags[key];
  }

  /**
   * Set a local override for a feature flag (development only)
   */
  async setOverride<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) {
    if (!__DEV__) {
      console.warn('Feature flag overrides are only allowed in development');
      return;
    }

    this.overrides[key] = value;
    await storage.setItem(FEATURE_FLAGS_OVERRIDE_KEY, JSON.stringify(this.overrides));
  }

  /**
   * Remove a local override
   */
  async removeOverride<K extends keyof FeatureFlags>(key: K) {
    if (key in this.overrides) {
      delete this.overrides[key];
      await storage.setItem(FEATURE_FLAGS_OVERRIDE_KEY, JSON.stringify(this.overrides));
    }
  }

  /**
   * Clear all local overrides
   */
  async clearOverrides() {
    this.overrides = {};
    await storage.removeItem(FEATURE_FLAGS_OVERRIDE_KEY);
  }

  /**
   * Update feature flags from server
   */
  async updateFlags(newFlags: Partial<FeatureFlags>) {
    this.flags = { ...this.flags, ...newFlags };
    await storage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(this.flags));
  }

  /**
   * Get all current flags (including overrides)
   */
  getAllFlags(): FeatureFlags {
    if (!this.isInitialized) {
      this.loadFlags();
    }

    return { ...this.flags, ...this.overrides };
  }

  /**
   * Get only the overrides
   */
  getOverrides(): Partial<FeatureFlags> {
    return { ...this.overrides };
  }

  /**
   * Reset to default flags
   */
  async resetToDefaults() {
    this.flags = { ...DEFAULT_FEATURE_FLAGS };
    this.overrides = {};
    await storage.removeItem(FEATURE_FLAGS_KEY);
    await storage.removeItem(FEATURE_FLAGS_OVERRIDE_KEY);
  }
}

// Create singleton instance
export const featureFlags = new FeatureFlagManager();

// Initialize feature flags with error handling
try {
  // This will be called when the module is imported
  featureFlags.get('enable_dark_mode'); // Trigger initialization
} catch (error) {
  console.warn('Failed to initialize feature flags:', error);
}

// Convenience functions for common flags
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return featureFlags.get(flag);
};

// Type-safe feature flag checks
export const flags = {
  // UI/UX
  darkMode: () => isFeatureEnabled('enable_dark_mode'),
  animations: () => isFeatureEnabled('enable_animations'),
  hapticFeedback: () => isFeatureEnabled('enable_haptic_feedback'),
  
  // KitAI
  kitai: () => isFeatureEnabled('enable_kitai'),
  kitaiAdvanced: () => isFeatureEnabled('enable_kitai_advanced'),
  kitaiAttachments: () => isFeatureEnabled('enable_kitai_file_attachments'),
  
  // Invoices
  invoiceTemplates: () => isFeatureEnabled('enable_invoice_templates'),
  invoiceCustomization: () => isFeatureEnabled('enable_invoice_customization'),
  bulkOperations: () => isFeatureEnabled('enable_bulk_operations'),
  
  // Sync
  offlineSync: () => isFeatureEnabled('enable_offline_sync'),
  backgroundSync: () => isFeatureEnabled('enable_background_sync'),
  conflictResolution: () => isFeatureEnabled('enable_conflict_resolution'),
  
  // Security
  biometricAuth: () => isFeatureEnabled('enable_biometric_auth'),
  dataEncryption: () => isFeatureEnabled('enable_data_encryption'),
  auditLogging: () => isFeatureEnabled('enable_audit_logging'),
  
  // Performance
  virtualizedLists: () => isFeatureEnabled('enable_virtualized_lists'),
  lazyLoading: () => isFeatureEnabled('enable_lazy_loading'),
  performanceMonitoring: () => isFeatureEnabled('enable_performance_monitoring'),
  
  // Experimental
  betaFeatures: () => isFeatureEnabled('enable_beta_features'),
  advancedSearch: () => isFeatureEnabled('enable_advanced_search'),
  analytics: () => isFeatureEnabled('enable_analytics'),
};

// Hook for React components
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  // This would be implemented with React state in a real hook
  // For now, return the current value
  return featureFlags.get(flag);
};

// Hook for multiple feature flags
export const useFeatureFlags = (flagsToCheck: (keyof FeatureFlags)[]): Record<keyof FeatureFlags, boolean> => {
  const result: Partial<Record<keyof FeatureFlags, boolean>> = {};
  
  flagsToCheck.forEach(flag => {
    result[flag] = featureFlags.get(flag);
  });
  
  return result as Record<keyof FeatureFlags, boolean>;
};


