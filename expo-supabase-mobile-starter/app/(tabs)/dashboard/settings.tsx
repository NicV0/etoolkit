import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Building2, User, FileText, Bell, Database, Palette } from 'lucide-react-native';

// Components
import {
  Card,
  Button,
  Input,
  Badge,
} from '../../../components/ui';

// Hooks
import { useSettingsStore } from '../../../lib/state/store';

// Theme
import { theme } from '../../../lib/theme/tokens';
import { textStyles } from '../../../lib/theme/utils';

// Settings section component
const SettingsSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <Card variant="outlined" style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={[textStyles.h3, styles.sectionTitle]}>
        {title}
      </Text>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </Card>
);

// Settings item component
const SettingsItem: React.FC<{
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  subtitle?: string;
}> = ({ label, value, rightElement, subtitle }) => (
  <View style={styles.settingsItem}>
    <View style={styles.settingsItemContent}>
      <Text style={[textStyles.body, styles.settingsItemLabel]}>
        {label}
      </Text>
      {subtitle && (
        <Text style={[textStyles.caption, styles.settingsItemSubtitle]}>
          {subtitle}
        </Text>
      )}
      {value && (
        <Text style={[textStyles.body, styles.settingsItemValue]}>
          {value}
        </Text>
      )}
    </View>
    {rightElement && (
      <View style={styles.settingsItemRight}>
        {rightElement}
      </View>
    )}
  </View>
);

// Main Settings screen
export default function SettingsScreen() {
  const { 
    organization, 
    businessProfile, 
    defaults, 
    notifications,
    updateOrganization,
    updateBusinessProfile,
    updateDefaults,
    updateNotifications
  } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  // Organization settings
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [orgLogo, setOrgLogo] = useState(organization?.logo || '');
  const [orgAccentColor, setOrgAccentColor] = useState(organization?.accentColor || '#2563EB');

  // Business profile
  const [businessAddress, setBusinessAddress] = useState(businessProfile?.address || '');
  const [businessPhone, setBusinessPhone] = useState(businessProfile?.phone || '');
  const [businessWebsite, setBusinessWebsite] = useState(businessProfile?.website || '');

  // Defaults
  const [defaultCurrency, setDefaultCurrency] = useState(defaults?.currency || 'USD');
  const [defaultTaxRate, setDefaultTaxRate] = useState(defaults?.taxRate?.toString() || '10');
  const [defaultTerms, setDefaultTerms] = useState(defaults?.paymentTerms || 'net30');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(notifications?.emailNotifications || false);
  const [pushNotifications, setPushNotifications] = useState(notifications?.pushNotifications || false);
  const [invoiceReminders, setInvoiceReminders] = useState(notifications?.invoiceReminders || false);

  // Data management
  const [autoBackup, setAutoBackup] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);

  // Handlers
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // Update organization
      updateOrganization({
        name: orgName,
        logo: orgLogo,
        accentColor: orgAccentColor,
      });

      // Update business profile
      updateBusinessProfile({
        address: businessAddress,
        phone: businessPhone,
        website: businessWebsite,
      });

      // Update defaults
      updateDefaults({
        currency: defaultCurrency,
        taxRate: parseFloat(defaultTaxRate),
        paymentTerms: defaultTerms as 'net15' | 'net30' | 'net45' | 'net60',
      });

      // Update notifications
      updateNotifications({
        emailNotifications: emailNotifications,
        pushNotifications: pushNotifications,
        invoiceReminders: invoiceReminders,
      });

      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    orgName, orgLogo, orgAccentColor,
    businessAddress, businessPhone, businessWebsite,
    defaultCurrency, defaultTaxRate, defaultTerms,
    emailNotifications, pushNotifications, invoiceReminders,
    updateOrganization, updateBusinessProfile, updateDefaults, updateNotifications,
  ]);

  const handleBackup = useCallback(() => {
    Alert.alert('Backup', 'Backup functionality will be implemented in Phase 5');
  }, []);

  const handleRestore = useCallback(() => {
    Alert.alert('Restore', 'Restore functionality will be implemented in Phase 5');
  }, []);

  const handleExport = useCallback(() => {
    Alert.alert('Export', 'Export functionality will be implemented in Phase 5');
  }, []);

  const handleImport = useCallback(() => {
    Alert.alert('Import', 'Import functionality will be implemented in Phase 5');
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          style={styles.backButton}
          leftIcon={<ArrowLeft size={20} color={theme.colors.text.primary} />}
          title="Back"
        />
        <View style={styles.headerContent}>
          <Text style={[textStyles.h2, styles.headerTitle]}>
            Settings
          </Text>
          <Text style={[textStyles.body, styles.headerSubtitle]}>
            Manage your organization and preferences
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Organization Settings */}
        <SettingsSection
          title="Organization"
          icon={<Building2 size={20} color={theme.colors.primary} />}
        >
          <Input
            label="Organization Name"
            value={orgName}
            onChangeText={setOrgName}
            placeholder="Enter organization name"
            style={styles.input}
          />
          <Input
            label="Logo URL"
            value={orgLogo}
            onChangeText={setOrgLogo}
            placeholder="Enter logo URL"
            style={styles.input}
          />
          <Input
            label="Accent Color"
            value={orgAccentColor}
            onChangeText={setOrgAccentColor}
            placeholder="Enter hex color (e.g., #2563EB)"
            style={styles.input}
          />
        </SettingsSection>

        {/* Business Profile */}
        <SettingsSection
          title="Business Profile"
          icon={<User size={20} color={theme.colors.primary} />}
        >
          <Input
            label="Business Address"
            value={businessAddress}
            onChangeText={setBusinessAddress}
            placeholder="Enter business address"
            multiline
            style={styles.input}
          />
          <Input
            label="Phone"
            value={businessPhone}
            onChangeText={setBusinessPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Input
            label="Website"
            value={businessWebsite}
            onChangeText={setBusinessWebsite}
            placeholder="Enter website URL"
            keyboardType="url"
            style={styles.input}
          />
        </SettingsSection>

        {/* Defaults */}
        <SettingsSection
          title="Defaults"
          icon={<FileText size={20} color={theme.colors.primary} />}
        >
          <Input
            label="Default Currency"
            value={defaultCurrency}
            onChangeText={setDefaultCurrency}
            placeholder="USD"
            style={styles.input}
          />
          <Input
            label="Default Tax Rate (%)"
            value={defaultTaxRate}
            onChangeText={setDefaultTaxRate}
            placeholder="10"
            keyboardType="numeric"
            style={styles.input}
          />
          <Input
            label="Default Terms"
            value={defaultTerms}
            onChangeText={(text) => setDefaultTerms(text as 'net15' | 'net30' | 'net45' | 'net60')}
            placeholder="Net 30"
            style={styles.input}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection
          title="Notifications"
          icon={<Bell size={20} color={theme.colors.primary} />}
        >
          <SettingsItem
            label="Email Notifications"
            subtitle="Receive notifications via email"
            rightElement={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={emailNotifications ? theme.colors.text.inverse : theme.colors.text.secondary}
              />
            }
          />
          <SettingsItem
            label="Push Notifications"
            subtitle="Receive push notifications"
            rightElement={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={pushNotifications ? theme.colors.text.inverse : theme.colors.text.secondary}
              />
            }
          />
          <SettingsItem
            label="Invoice Reminders"
            subtitle="Get reminded about overdue invoices"
            rightElement={
              <Switch
                value={invoiceReminders}
                onValueChange={setInvoiceReminders}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={invoiceReminders ? theme.colors.text.inverse : theme.colors.text.secondary}
              />
            }
          />
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection
          title="Data Management"
          icon={<Database size={20} color={theme.colors.primary} />}
        >
          <SettingsItem
            label="Auto Backup"
            subtitle="Automatically backup data"
            rightElement={
              <Switch
                value={autoBackup}
                onValueChange={setAutoBackup}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={autoBackup ? theme.colors.text.inverse : theme.colors.text.secondary}
              />
            }
          />
          <SettingsItem
            label="Sync Enabled"
            subtitle="Sync data across devices"
            rightElement={
              <Switch
                value={syncEnabled}
                onValueChange={setSyncEnabled}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={syncEnabled ? theme.colors.text.inverse : theme.colors.text.secondary}
              />
            }
          />
          <SettingsItem
            label="Backup Data"
            subtitle="Create a backup of your data"
            onPress={handleBackup}
            rightElement={<Badge variant="info">Manual</Badge>}
          />
          <SettingsItem
            label="Restore Data"
            subtitle="Restore from a backup"
            onPress={handleRestore}
            rightElement={<Badge variant="warning">Caution</Badge>}
          />
        </SettingsSection>

        {/* Import/Export */}
        <SettingsSection
          title="Import/Export"
          icon={<Palette size={20} color={theme.colors.primary} />}
        >
          <SettingsItem
            label="Export Data"
            subtitle="Export your data as CSV"
            onPress={handleExport}
            rightElement={<Badge variant="info">CSV</Badge>}
          />
          <SettingsItem
            label="Import Data"
            subtitle="Import data from CSV"
            onPress={handleImport}
            rightElement={<Badge variant="info">CSV</Badge>}
          />
        </SettingsSection>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Button
            variant="primary"
            size="lg"
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
            title="Save Settings"
          />
        </View>
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    color: theme.colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
  },
  sectionContent: {
    gap: theme.spacing.md,
  },
  input: {
    marginBottom: 0,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemLabel: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingsItemSubtitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  settingsItemValue: {
    color: theme.colors.text.secondary,
  },
  settingsItemRight: {
    marginLeft: theme.spacing.md,
  },
  saveSection: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  saveButton: {
    width: '100%',
  },
});
