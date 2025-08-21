import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrivacySettings {
  allowCloudProcessing: boolean;
  allowDataCollection: boolean;
  allowAnalytics: boolean;
  allowCrashReporting: boolean;
  dataRetentionDays: number;
  autoSync: boolean;
}

export interface PrivacyConsent {
  timestamp: string;
  version: string;
  settings: PrivacySettings;
  userAcknowledged: boolean;
}

export class PrivacyControls {
  private static instance: PrivacyControls;
  private static readonly STORAGE_KEY = 'kitai_privacy_settings';
  private static readonly CONSENT_KEY = 'kitai_privacy_consent';
  private static readonly VERSION = '1.0.0';

  static getInstance(): PrivacyControls {
    if (!PrivacyControls.instance) {
      PrivacyControls.instance = new PrivacyControls();
    }
    return PrivacyControls.instance;
  }

  /**
   * Get current privacy settings
   */
  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const stored = await AsyncStorage.getItem(PrivacyControls.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load privacy settings:', error);
    }

    // Return default settings
    return this.getDefaultSettings();
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<void> {
    try {
      const current = await this.getPrivacySettings();
      const updated = { ...current, ...settings };
      
      await AsyncStorage.setItem(PrivacyControls.STORAGE_KEY, JSON.stringify(updated));
      
      // Update consent record
      await this.updateConsent(updated);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      throw error;
    }
  }

  /**
   * Get privacy consent record
   */
  async getPrivacyConsent(): Promise<PrivacyConsent | null> {
    try {
      const stored = await AsyncStorage.getItem(PrivacyControls.CONSENT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load privacy consent:', error);
      return null;
    }
  }

  /**
   * Check if user has given consent
   */
  async hasConsent(): Promise<boolean> {
    const consent = await this.getPrivacyConsent();
    return consent?.userAcknowledged === true;
  }

  /**
   * Record user consent
   */
  async recordConsent(settings: PrivacySettings): Promise<void> {
    try {
      const consent: PrivacyConsent = {
        timestamp: new Date().toISOString(),
        version: PrivacyControls.VERSION,
        settings,
        userAcknowledged: true,
      };

      await AsyncStorage.setItem(PrivacyControls.CONSENT_KEY, JSON.stringify(consent));
      await AsyncStorage.setItem(PrivacyControls.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to record privacy consent:', error);
      throw error;
    }
  }

  /**
   * Check if cloud processing is allowed
   */
  async isCloudProcessingAllowed(): Promise<boolean> {
    const settings = await this.getPrivacySettings();
    return settings.allowCloudProcessing;
  }

  /**
   * Check if data collection is allowed
   */
  async isDataCollectionAllowed(): Promise<boolean> {
    const settings = await this.getPrivacySettings();
    return settings.allowDataCollection;
  }

  /**
   * Check if analytics is allowed
   */
  async isAnalyticsAllowed(): Promise<boolean> {
    const settings = await this.getPrivacySettings();
    return settings.allowAnalytics;
  }

  /**
   * Check if crash reporting is allowed
   */
  async isCrashReportingAllowed(): Promise<boolean> {
    const settings = await this.getPrivacySettings();
    return settings.allowCrashReporting;
  }

  /**
   * Get data retention period in days
   */
  async getDataRetentionDays(): Promise<number> {
    const settings = await this.getPrivacySettings();
    return settings.dataRetentionDays;
  }

  /**
   * Check if auto-sync is enabled
   */
  async isAutoSyncEnabled(): Promise<boolean> {
    const settings = await this.getPrivacySettings();
    return settings.autoSync;
  }

  /**
   * Reset privacy settings to defaults
   */
  async resetToDefaults(): Promise<void> {
    try {
      const defaultSettings = this.getDefaultSettings();
      await this.recordConsent(defaultSettings);
    } catch (error) {
      console.error('Failed to reset privacy settings:', error);
      throw error;
    }
  }

  /**
   * Export privacy settings
   */
  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getPrivacySettings();
      const consent = await this.getPrivacyConsent();
      
      return JSON.stringify({
        settings,
        consent,
        exportedAt: new Date().toISOString(),
        version: PrivacyControls.VERSION,
      }, null, 2);
    } catch (error) {
      console.error('Failed to export privacy settings:', error);
      throw error;
    }
  }

  /**
   * Import privacy settings
   */
  async importSettings(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.settings && data.consent) {
        await AsyncStorage.setItem(PrivacyControls.STORAGE_KEY, JSON.stringify(data.settings));
        await AsyncStorage.setItem(PrivacyControls.CONSENT_KEY, JSON.stringify(data.consent));
      } else {
        throw new Error('Invalid privacy settings format');
      }
    } catch (error) {
      console.error('Failed to import privacy settings:', error);
      throw error;
    }
  }

  /**
   * Clear all privacy data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PrivacyControls.STORAGE_KEY);
      await AsyncStorage.removeItem(PrivacyControls.CONSENT_KEY);
    } catch (error) {
      console.error('Failed to clear privacy data:', error);
      throw error;
    }
  }

  /**
   * Get privacy policy summary
   */
  getPrivacyPolicySummary(): string {
    return `
Privacy Policy Summary for KitAI:

1. Data Processing:
   - Local processing: All AI tools work offline by default
   - Cloud processing: Optional, requires explicit consent
   - Data retention: Configurable (7-365 days)

2. Data Collection:
   - Search queries: Stored locally for improvement
   - Usage analytics: Optional, anonymized
   - Crash reports: Optional, no personal data

3. User Control:
   - Full control over all privacy settings
   - Ability to export/import settings
   - Option to clear all data
   - Granular permissions for each feature

4. Security:
   - All data encrypted in transit and at rest
   - No data shared with third parties without consent
   - Local-first architecture for maximum privacy
    `;
  }

  /**
   * Get default privacy settings
   */
  private getDefaultSettings(): PrivacySettings {
    return {
      allowCloudProcessing: false,
      allowDataCollection: true,
      allowAnalytics: false,
      allowCrashReporting: false,
      dataRetentionDays: 30,
      autoSync: true,
    };
  }

  /**
   * Update consent record
   */
  private async updateConsent(settings: PrivacySettings): Promise<void> {
    try {
      const existingConsent = await this.getPrivacyConsent();
      const updatedConsent: PrivacyConsent = {
        timestamp: new Date().toISOString(),
        version: PrivacyControls.VERSION,
        settings,
        userAcknowledged: existingConsent?.userAcknowledged || false,
      };

      await AsyncStorage.setItem(PrivacyControls.CONSENT_KEY, JSON.stringify(updatedConsent));
    } catch (error) {
      console.warn('Failed to update consent record:', error);
    }
  }
}

// Export singleton instance
export const privacyControls = PrivacyControls.getInstance();
