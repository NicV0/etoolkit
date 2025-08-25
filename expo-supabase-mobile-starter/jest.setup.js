// Jest setup file for eToolkit
// This file runs before each test

// Set up environment variables for tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    // Mock problematic modules
    NativeModules: {
      ...RN.NativeModules,
      DevMenu: {
        show: jest.fn(),
      },
    },
  };
});

// Mock Expo modules
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file://test.pdf' }),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn().mockResolvedValue('test content'),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({
    type: 'success',
    uri: 'file://test.pdf',
    name: 'test.pdf',
    size: 1024,
  }),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: 'wifi' })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    execAsync: jest.fn(() => Promise.resolve([])),
    runAsync: jest.fn(() => Promise.resolve()),
    getAllAsync: jest.fn(() => Promise.resolve([])),
    getFirstAsync: jest.fn(() => Promise.resolve(null)),
  })),
}));

// Mock Supabase client with realistic test data
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: {
              id: 'test-quote-id',
              org_id: 'test-org-id',
              number: 'Q-001',
              client_id: 'test-client-id',
              status: 'accepted',
              currency: 'USD',
              tax_rate_pct: 8.5,
              discount_amt: 0,
              subtotal: 200,
              tax_total: 17,
              total: 217,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              client: { id: 'test-client-id', name: 'Test Client', email: 'test@example.com' },
              items: [
                {
                  id: 'item-1',
                  description: 'Test Item 1',
                  quantity: 2,
                  unit_price: 100,
                  taxable: true,
                  line_total: 200
                }
              ]
            }, 
            error: null 
          })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          range: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        lte: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        or: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        in: jest.fn(() => ({
          lt: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: {
              id: 'test-invoice-id',
              org_id: 'test-org-id',
              number: 'INV-001',
              client_id: 'test-client-id',
              quote_id: 'test-quote-id',
              status: 'draft',
              currency: 'USD',
              tax_rate_pct: 8.5,
              discount_amt: 0,
              subtotal: 200,
              tax_total: 17,
              total: 217,
              balance_due: 217,
              issue_date: new Date().toISOString().split('T')[0],
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              client: { id: 'test-client-id', name: 'Test Client', email: 'test@example.com' },
              items: [
                {
                  id: 'item-1',
                  description: 'Test Item 1',
                  quantity: 2,
                  unit_price: 100,
                  taxable: true,
                  line_total: 200
                }
              ],
              payments: []
            }, 
            error: null 
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: {
                id: 'test-quote-id',
                status: 'expired',
                updated_at: new Date().toISOString()
              }, 
              error: null 
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
};

jest.mock('./lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
