import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Building, CheckCircle, ArrowRight } from 'lucide-react-native';

const onboardingSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  trade: z.string().min(1, 'Please select your trade'),
  businessSize: z.string().min(1, 'Please select your business size'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(1, 'Please select your currency'),
  defaultTaxRate: z.string().optional()
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const trades = [
  { value: 'general_contractor', label: 'General Contractor' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'roofer', label: 'Roofer' },
  { value: 'painter', label: 'Painter' },
  { value: 'landscaper', label: 'Landscaper' },
  { value: 'other', label: 'Other' }
];

const businessSizes = [
  { value: 'solo', label: 'Solo (Just me)' },
  { value: 'small', label: 'Small (2-5 employees)' },
  { value: 'medium', label: 'Medium (6-20 employees)' },
  { value: 'large', label: 'Large (20+ employees)' }
];

const currencies = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' }
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      organizationName: '',
      trade: '',
      businessSize: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      currency: 'USD',
      defaultTaxRate: '8.5'
    }
  });

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      // TODO: Implement organization creation logic
      console.log('Create organization:', data);
      
      Alert.alert(
        'Welcome to eToolkit!',
        'Your organization has been created successfully. You can now start managing your clients and projects.',
        [
          {
            text: 'Get Started',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create organization. Please try again.');
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome to eToolkit</Text>
      <Text className="text-gray-600 mb-6">
        Let's get your business set up. First, tell us about your organization.
      </Text>

      <Controller
        control={control}
        name="organizationName"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Organization Name *"
            value={value}
            onChangeText={onChange}
            error={errors.organizationName?.message}
            placeholder="Enter your business name"
            className="mb-4"
          />
        )}
      />

      <Text className="text-sm font-medium text-gray-700 mb-3">What type of business do you run? *</Text>
      <View className="space-y-2 mb-4">
        {trades.map((trade) => (
          <Button
            key={trade.value}
            variant={selectedTrade === trade.value ? 'primary' : 'ghost'}
            onPress={() => {
              setSelectedTrade(trade.value);
              setValue('trade', trade.value);
            }}
            className="justify-start"
          >
            {trade.label}
          </Button>
        ))}
      </View>
      {errors.trade?.message && (
        <Text className="text-sm text-red-600 mb-4">{errors.trade.message}</Text>
      )}

      <Text className="text-sm font-medium text-gray-700 mb-3">How many employees do you have? *</Text>
      <View className="space-y-2 mb-4">
        {businessSizes.map((size) => (
          <Button
            key={size.value}
            variant={selectedSize === size.value ? 'primary' : 'ghost'}
            onPress={() => {
              setSelectedSize(size.value);
              setValue('businessSize', size.value);
            }}
            className="justify-start"
          >
            {size.label}
          </Button>
        ))}
      </View>
      {errors.businessSize?.message && (
        <Text className="text-sm text-red-600 mb-4">{errors.businessSize.message}</Text>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-2xl font-bold text-gray-900 mb-2">Your Information</Text>
      <Text className="text-gray-600 mb-6">
        Let's set up your profile and contact information.
      </Text>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <Input
                label="First Name *"
                value={value}
                onChangeText={onChange}
                error={errors.firstName?.message}
                placeholder="Enter your first name"
              />
            )}
          />
        </View>
        <View className="flex-1">
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Last Name *"
                value={value}
                onChangeText={onChange}
                error={errors.lastName?.message}
                placeholder="Enter your last name"
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Phone Number"
            value={value}
            onChangeText={onChange}
            error={errors.phone?.message}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            className="mb-4"
          />
        )}
      />

      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Business Address"
            value={value}
            onChangeText={onChange}
            error={errors.address?.message}
            placeholder="Enter your business address"
            multiline
            numberOfLines={3}
            className="mb-4"
          />
        )}
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-2xl font-bold text-gray-900 mb-2">Business Settings</Text>
      <Text className="text-gray-600 mb-6">
        Configure your default business settings. You can change these later.
      </Text>

      <Text className="text-sm font-medium text-gray-700 mb-3">Default Currency *</Text>
      <View className="space-y-2 mb-4">
        {currencies.map((currency) => (
          <Button
            key={currency.value}
            variant={selectedCurrency === currency.value ? 'primary' : 'ghost'}
            onPress={() => {
              setSelectedCurrency(currency.value);
              setValue('currency', currency.value);
            }}
            className="justify-start"
          >
            {currency.label}
          </Button>
        ))}
      </View>
      {errors.currency?.message && (
        <Text className="text-sm text-red-600 mb-4">{errors.currency.message}</Text>
      )}

      <Controller
        control={control}
        name="defaultTaxRate"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Default Tax Rate (%)"
            value={value}
            onChangeText={onChange}
            error={errors.defaultTaxRate?.message}
            placeholder="8.5"
            keyboardType="decimal-pad"
            className="mb-4"
          />
        )}
      />

      <Card className="mb-4">
        <View className="flex-row items-center mb-3">
          <CheckCircle size={20} className="text-green-600 mr-2" />
          <Text className="text-lg font-semibold text-gray-900">You're all set!</Text>
        </View>
        <Text className="text-gray-600">
          Your organization will be created with these settings. You can always modify them later in the settings.
        </Text>
      </Card>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Building size={24} className="text-primary-600 mr-2" />
            <Text className="text-xl font-bold text-gray-900">eToolkit</Text>
          </View>
          <Badge variant="secondary">Step {currentStep} of 3</Badge>
        </View>
        
        {/* Progress Bar */}
        <View className="w-full bg-gray-200 rounded-full h-2">
          <View 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <Card>
          {renderCurrentStep()}
        </Card>
      </ScrollView>

      {/* Footer */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row gap-3">
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onPress={prevStep}
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button
              onPress={nextStep}
              className="flex-1"
            >
              Next
              <ArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onPress={handleSubmit(onSubmit)}
              className="flex-1"
            >
              Create Organization
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}
