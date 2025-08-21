import { kitAITools } from '../../lib/kitai/tools';
import { privacyControls } from '../../lib/kitai/privacy';
import { kitAISQLite } from '../../lib/kitai/sqlite';
import { kitAI } from '../../lib/kitai';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          or: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null }))
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock SQLite
jest.mock('../../lib/sqlite', () => ({
  getDatabase: jest.fn(() => ({
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
  }))
}));

describe('KitAI Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchClients', () => {
    it('should search for clients online first', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '123-456-7890',
                    status: 'active'
                  }
                ],
                error: null
              })
            })
          })
        })
      });

      const results = await kitAITools.searchClients('john', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('John Doe');
      expect(results[0].type).toBe('client');
    });

    it('should fallback to offline search when online fails', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            or: jest.fn().mockRejectedValue(new Error('Network error'))
          })
        })
      });

      const mockSQLite = require('../../lib/sqlite').getDatabase();
      mockSQLite.getAllAsync.mockResolvedValue([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          status: 'active'
        }
      ]);

      const results = await kitAITools.searchClients('john', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('John Doe');
    });
  });

  describe('searchPricebook', () => {
    it('should search for pricebook items', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: '1',
                      name: 'Plumbing Service',
                      code: 'PLUMB-001',
                      category: 'Services',
                      unit_price: '150.00',
                      unit: 'hour'
                    }
                  ],
                  error: null
                })
              })
            })
          })
        })
      });

      const results = await kitAITools.searchPricebook('plumbing', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Plumbing Service');
      expect(results[0].type).toBe('pricebook');
    });
  });

  describe('suggestLineItems', () => {
    it('should suggest line items based on description', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [
                    {
                      name: 'Plumbing Service',
                      unit_price: '150.00',
                      category: 'Services',
                      unit: 'hour'
                    }
                  ],
                  error: null
                })
              })
            })
          })
        })
      });

      const suggestions = await kitAITools.suggestLineItems('plumbing repair', 'org-1');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].description).toBe('Plumbing Service');
      expect(suggestions[0].unitPrice).toBe(150);
    });
  });

  describe('processQuery', () => {
    it('should handle client queries', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '123-456-7890',
                    status: 'active'
                  }
                ],
                error: null
              })
            })
          })
        })
      });

      const results = await kitAITools.processQuery('find client john', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('John Doe');
    });

    it('should handle pricebook queries', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: '1',
                      name: 'Plumbing Service',
                      code: 'PLUMB-001',
                      category: 'Services',
                      unit_price: '150.00',
                      unit: 'hour'
                    }
                  ],
                  error: null
                })
              })
            })
          })
        })
      });

      const results = await kitAITools.processQuery('find pricebook plumbing', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Plumbing Service');
    });
  });
});

describe('Privacy Controls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrivacySettings', () => {
    it('should return default settings when none stored', async () => {
      const settings = await privacyControls.getPrivacySettings();
      
      expect(settings.allowCloudProcessing).toBe(false);
      expect(settings.allowDataCollection).toBe(true);
      expect(settings.allowAnalytics).toBe(false);
      expect(settings.allowCrashReporting).toBe(false);
      expect(settings.dataRetentionDays).toBe(30);
      expect(settings.autoSync).toBe(true);
    });
  });

  describe('updatePrivacySettings', () => {
    it('should update settings', async () => {
      const updates = {
        allowCloudProcessing: true,
        allowAnalytics: true
      };

      await privacyControls.updatePrivacySettings(updates);
      const settings = await privacyControls.getPrivacySettings();
      
      expect(settings.allowCloudProcessing).toBe(true);
      expect(settings.allowAnalytics).toBe(true);
    });
  });

  describe('hasConsent', () => {
    it('should return false when no consent recorded', async () => {
      const hasConsent = await privacyControls.hasConsent();
      expect(hasConsent).toBe(false);
    });
  });

  describe('recordConsent', () => {
    it('should record user consent', async () => {
      const settings = {
        allowCloudProcessing: true,
        allowDataCollection: true,
        allowAnalytics: false,
        allowCrashReporting: false,
        dataRetentionDays: 30,
        autoSync: true,
      };

      await privacyControls.recordConsent(settings);
      const hasConsent = await privacyControls.hasConsent();
      
      expect(hasConsent).toBe(true);
    });
  });
});

describe('KitAI SQLite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize database and create tables', async () => {
      const mockSQLite = require('../../lib/sqlite').getDatabase();
      mockSQLite.execAsync.mockResolvedValue(undefined);

      await kitAISQLite.initialize();
      
      expect(mockSQLite.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS kitai_search_index')
      );
    });
  });

  describe('indexClient', () => {
    it('should index client data', async () => {
      const mockSQLite = require('../../lib/sqlite').getDatabase();
      mockSQLite.runAsync.mockResolvedValue(undefined);

      const client = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        company: 'ACME Corp',
        status: 'active'
      };

      await kitAISQLite.indexClient(client);
      
      expect(mockSQLite.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO kitai_search_index'),
        expect.arrayContaining(['client_1', 'client', '1'])
      );
    });
  });

  describe('search', () => {
    it('should search indexed data', async () => {
      const mockSQLite = require('../../lib/sqlite').getDatabase();
      mockSQLite.getAllAsync.mockResolvedValue([
        {
          id: 'client_1',
          entity_type: 'client',
          entity_id: '1',
          search_text: 'john doe john@example.com 123-456-7890 acme corp',
          metadata: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            company: 'ACME Corp',
            status: 'active'
          }),
          last_updated: new Date().toISOString()
        }
      ]);

      const results = await kitAISQLite.search('john');
      
      expect(results).toHaveLength(1);
      expect(results[0].entityType).toBe('client');
      expect(results[0].entityId).toBe('1');
    });
  });
});

describe('KitAI Main Class', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize all components', async () => {
      const mockSQLite = require('../../lib/sqlite').getDatabase();
      mockSQLite.execAsync.mockResolvedValue(undefined);

      await kitAI.initialize();
      
      expect(mockSQLite.execAsync).toHaveBeenCalled();
    });
  });

  describe('processQuery', () => {
    it('should process queries with privacy checks', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '123-456-7890',
                    status: 'active'
                  }
                ],
                error: null
              })
            })
          })
        })
      });

      const results = await kitAI.processQuery('find client john', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('John Doe');
    });

    it('should fallback to offline search when online fails', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            or: jest.fn().mockRejectedValue(new Error('Network error'))
          })
        })
      });

      const mockSQLite = require('../../lib/sqlite').getDatabase();
      mockSQLite.getAllAsync.mockResolvedValue([
        {
          id: 'client_1',
          entity_type: 'client',
          entity_id: '1',
          search_text: 'john doe',
          metadata: JSON.stringify({ name: 'John Doe' }),
          last_updated: new Date().toISOString()
        }
      ]);

      const results = await kitAI.processQuery('find client john', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].entityType).toBe('client');
    });
  });

  describe('getQuickActions', () => {
    it('should return quick actions', async () => {
      const actions = await kitAI.getQuickActions('org-1');
      
      expect(actions).toContain('Create new quote');
      expect(actions).toContain('Add new client');
      expect(actions).toContain('Record payment');
    });
  });

  describe('searchClients', () => {
    it('should search for clients', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            or: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '123-456-7890',
                    status: 'active'
                  }
                ],
                error: null
              })
            })
          })
        })
      });

      const results = await kitAI.searchClients('john', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('John Doe');
    });
  });

  describe('searchPricebook', () => {
    it('should search for pricebook items', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [
                    {
                      id: '1',
                      name: 'Plumbing Service',
                      code: 'PLUMB-001',
                      category: 'Services',
                      unit_price: '150.00',
                      unit: 'hour'
                    }
                  ],
                  error: null
                })
              })
            })
          })
        })
      });

      const results = await kitAI.searchPricebook('plumbing', 'org-1');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Plumbing Service');
    });
  });

  describe('suggestLineItems', () => {
    it('should suggest line items', async () => {
      const mockSupabase = require('../../lib/supabase').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [
                    {
                      name: 'Plumbing Service',
                      unit_price: '150.00',
                      category: 'Services',
                      unit: 'hour'
                    }
                  ],
                  error: null
                })
              })
            })
          })
        })
      });

      const suggestions = await kitAI.suggestLineItems('plumbing repair', 'org-1');
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].description).toBe('Plumbing Service');
    });
  });

  describe('getPrivacySettings', () => {
    it('should return privacy settings', async () => {
      const settings = await kitAI.getPrivacySettings();
      
      expect(settings).toHaveProperty('allowCloudProcessing');
      expect(settings).toHaveProperty('allowDataCollection');
      expect(settings).toHaveProperty('allowAnalytics');
      expect(settings).toHaveProperty('allowCrashReporting');
      expect(settings).toHaveProperty('dataRetentionDays');
      expect(settings).toHaveProperty('autoSync');
    });
  });

  describe('getSearchStats', () => {
    it('should return search statistics', async () => {
      const mockSQLite = require('../../lib/sqlite').getDatabase();
      mockSQLite.getFirstAsync.mockResolvedValue({ count: 5 });
      mockSQLite.getAllAsync.mockResolvedValue([
        { entity_type: 'client', count: 3 },
        { entity_type: 'pricebook', count: 2 }
      ]);

      const stats = await kitAI.getSearchStats();
      
      expect(stats.totalEntries).toBe(5);
      expect(stats.byType.client).toBe(3);
      expect(stats.byType.pricebook).toBe(2);
    });
  });
});
