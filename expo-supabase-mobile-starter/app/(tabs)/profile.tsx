import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ListItem } from '../../components/ui/ListItem';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save,
  X,
  Bell,
  Moon,
  Shield,
  LogOut
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const { user, session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const { control, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      address: user?.user_metadata?.address || '',
      bio: user?.user_metadata?.bio || ''
    }
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      // TODO: Implement profile update logic
      console.log('Update profile:', data);
      
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.back()}
              className="mr-3"
            >
              <ArrowLeft size={20} />
            </Button>
            <Text className="text-lg font-semibold text-gray-900">Profile</Text>
          </View>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setIsEditing(true)}
            >
              <Edit size={16} />
            </Button>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Profile Header */}
        <Card className="mb-4">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-3">
              <User size={32} className="text-white" />
            </View>
            <Text className="text-xl font-semibold text-gray-900">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </Text>
            <Text className="text-gray-600">{user?.email}</Text>
          </View>
        </Card>

        {/* Profile Information */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Personal Information</Text>
          
          {isEditing ? (
            <View>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Full Name *"
                    value={value}
                    onChangeText={onChange}
                    error={errors.fullName?.message}
                    className="mb-4"
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Email *"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                    className="mb-4"
                    keyboardType="email-address"
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
                    className="mb-4"
                    keyboardType="phone-pad"
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
                    className="mb-4"
                    multiline
                    numberOfLines={2}
                  />
                )}
              />

              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Bio"
                    value={value}
                    onChangeText={onChange}
                    error={errors.bio?.message}
                    className="mb-4"
                    multiline
                    numberOfLines={3}
                  />
                )}
              />

              <View className="flex-row space-x-3">
                <Button
                  onPress={() => setIsEditing(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit(onSubmitProfile)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              <View className="flex-row items-center">
                <User size={16} className="text-gray-500 mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-600">Full Name</Text>
                  <Text className="text-gray-900">{user?.user_metadata?.full_name || 'Not set'}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Mail size={16} className="text-gray-500 mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-600">Email</Text>
                  <Text className="text-gray-900">{user?.email}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <Phone size={16} className="text-gray-500 mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-600">Phone</Text>
                  <Text className="text-gray-900">{user?.user_metadata?.phone || 'Not set'}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <MapPin size={16} className="text-gray-500 mr-3" />
                <View className="flex-1">
                  <Text className="text-gray-600">Address</Text>
                  <Text className="text-gray-900">{user?.user_metadata?.address || 'Not set'}</Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Preferences */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Preferences</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Moon size={16} className="text-gray-500 mr-3" />
                <Text className="text-gray-900">Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
              />
            </View>
            
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Bell size={16} className="text-gray-500 mr-3" />
                <Text className="text-gray-900">Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
              />
            </View>
            
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Mail size={16} className="text-gray-500 mr-3" />
                <Text className="text-gray-900">Email Notifications</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                thumbColor={emailNotifications ? '#ffffff' : '#ffffff'}
              />
            </View>
          </View>
        </Card>

        {/* Account Actions */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Account</Text>
          
          <View className="space-y-3">
            <ListItem
              icon={<Shield size={16} />}
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => router.push('/settings/privacy')}
            />
            
            <ListItem
              icon={<LogOut size={16} />}
              title="Sign Out"
              subtitle="Sign out of your account"
              onPress={handleSignOut}
              titleClassName="text-red-600"
            />
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
