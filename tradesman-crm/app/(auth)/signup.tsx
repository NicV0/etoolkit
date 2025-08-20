import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link, router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const TRADES = [
  'Plumber',
  'Electrician',
  'HVAC Technician',
  'Carpenter',
  'Painter',
  'Roofer',
  'Flooring Specialist',
  'General Contractor',
  'Landscaper',
  'Other',
];

const BUSINESS_SIZES = [
  'Solo (Just me)',
  'Small (2-5 employees)',
  'Medium (6-20 employees)',
  'Large (20+ employees)',
];

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [trade, setTrade] = useState(TRADES[0]);
  const [businessSize, setBusinessSize] = useState(BUSINESS_SIZES[0]);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !businessName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, {
      businessName,
      trade,
      businessSize,
    });
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }
      ]);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Set up your business profile</Text>
            </View>

            <Card>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />
              
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                required
              />
            </Card>

            <Card>
              <Text style={styles.sectionTitle}>Business Information</Text>
              <Input
                label="Business Name"
                value={businessName}
                onChangeText={setBusinessName}
                required
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Trade</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={trade}
                    onValueChange={setTrade}
                    style={styles.pickerStyle}
                  >
                    {TRADES.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Business Size</Text>
                <View style={styles.picker}>
                  <Picker
                    selectedValue={businessSize}
                    onValueChange={setBusinessSize}
                    style={styles.pickerStyle}
                  >
                    {BUSINESS_SIZES.map((size) => (
                      <Picker.Item key={size} label={size} value={size} />
                    ))}
                  </Picker>
                </View>
              </View>
            </Card>

            <Button
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSignUp}
              disabled={loading}
              style={styles.signUpButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Link href="/(auth)/signin" style={styles.link}>
                  Sign In
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerStyle: {
    height: 50,
  },
  signUpButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});