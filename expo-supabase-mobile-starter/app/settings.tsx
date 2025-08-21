import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ListItem } from '../components/ui/ListItem';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Settings, 
  User, 
  Building, 
  Bell, 
  Moon, 
  LogOut, 
  ArrowLeft,
  DollarSign,
  FileText,
  Shield,
  HelpCircle,
  Info
} from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  trade: z.string().optional(),
  legalName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  website: z.string().optional(),
  currency: z.string().optional(),
  defaultTaxRate: z.string().optional()
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function SettingsScreen() {
  const { user, session } = useAuth();
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Mock organization data - replace with real data
  const [organization] = useState({
    name: 'Smith Construction',
    trade: 'General Contractor',
    legalName: 'Smith Construction LLC',
    address: '123 Business St, Anytown, ST 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@smithconstruction.com',
    website: 'www.smithconstruction.com',
    currency: 'USD',
    defaultTaxRate: '8.5'
  });

  const { control, handleSubmit, formState: { errors } } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization.name,
      trade: organization.trade,
      legalName: organization.legalName,
      address: organization.address,
      phone: organization.phone,
      email: organization.email,
      website: organization.website,
      currency: organization.currency,
      defaultTaxRate: organization.defaultTaxRate
    }
  });

  const onSubmitOrg = (data: OrganizationFormData) => {
    // TODO: Implement update logic
    console.log('Update organization:', data);
    setIsEditingOrg(false);
    Alert.alert('Success', 'Organization settings updated successfully');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          onPress: async () => {
            // TODO: Implement sign out logic
            router.replace('/(auth)/sign-in');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft size={20} />
          </Button>
          <Text className="text-lg font-semibold text-gray-900">Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* User Profile */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">User Profile</Text>
          
          <ListItem
            icon={<User size={16} />}
            title="Name"
            subtitle={user?.user_metadata?.full_name || user?.email || 'Not set'}
            onPress={() => router.push('/profile')}
          />
          
          <ListItem
            icon={<Building size={16} />}
            title="Organization"
            subtitle={organization.name}
            onPress={() => setIsEditingOrg(true)}
          />
        </Card>

        {/* Organization Settings */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Organization</Text>
          
          <ListItem
            icon={<DollarSign size={16} />}
            title="Currency"
            subtitle={organization.currency}
            onPress={() => router.push('/settings/currency')}
          />
          
          <ListItem
            icon={<FileText size={16} />}
            title="Default Tax Rate"
            subtitle={`${organization.defaultTaxRate}%`}
            onPress={() => router.push('/settings/tax')}
          />
          
          <ListItem
            icon={<Shield size={16} />}
            title="Billing & Plan"
            subtitle="Professional Plan"
            onPress={() => router.push('/settings/billing')}
          />
        </Card>

        {/* App Preferences */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Preferences</Text>
          
          <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <Moon size={16} className="mr-3 text-gray-600" />
              <Text className="text-gray-900">Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
            />
          </View>
          
          <View className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <Bell size={16} className="mr-3 text-gray-600" />
              <Text className="text-gray-900">Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
            />
          </View>
        </Card>

        {/* Support & Help */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Support</Text>
          
          <ListItem
            icon={<HelpCircle size={16} />}
            title="Help & Documentation"
            subtitle="View guides and tutorials"
            onPress={() => router.push('/help')}
          />
          
          <ListItem
            icon={<Info size={16} />}
            title="About eToolkit"
            subtitle="Version 1.0.0"
            onPress={() => router.push('/about')}
          />
        </Card>

        {/* Account Actions */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-3">Account</Text>
          
          <ListItem
            icon={<LogOut size={16} />}
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleSignOut}
          />
          
          <ListItem
            icon={<Settings size={16} />}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            titleClassName="text-red-600"
          />
        </Card>
      </ScrollView>

      {/* Edit Organization Modal */}
      <Modal
        visible={isEditingOrg}
        onClose={() => setIsEditingOrg(false)}
        title="Edit Organization"
      >
        <View className="p-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Organization Name *"
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="trade"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Trade"
                value={value}
                onChangeText={onChange}
                error={errors.trade?.message}
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="legalName"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Legal Name"
                value={value}
                onChangeText={onChange}
                error={errors.legalName?.message}
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Address"
                value={value}
                onChangeText={onChange}
                error={errors.address?.message}
                multiline
                numberOfLines={3}
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Phone"
                value={value}
                onChangeText={onChange}
                error={errors.phone?.message}
                keyboardType="phone-pad"
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                className="mb-4"
              />
            )}
          />

          <Controller
            control={control}
            name="website"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Website"
                value={value}
                onChangeText={onChange}
                error={errors.website?.message}
                keyboardType="url"
                autoCapitalize="none"
                className="mb-6"
              />
            )}
          />

          <View className="flex-row gap-3">
            <Button
              variant="secondary"
              onPress={() => setIsEditingOrg(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSubmit(onSubmitOrg)}
              className="flex-1"
            >
              Save Changes
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
