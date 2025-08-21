# Offline-First Data Layer

This module provides a comprehensive offline-first data layer for the eToolkit mobile application, enabling seamless operation with or without network connectivity.

## Overview

The offline-first architecture consists of three main components:

1. **SQLite Database** (`lib/sqlite.ts`) - Local data storage
2. **Sync Service** (`lib/sync.ts`) - Data synchronization between local and remote
3. **Offline Data Layer** (`lib/offline-data.ts`) - High-level data operations

## Features

- **Offline-First**: All data operations work offline with automatic sync when online
- **Conflict Resolution**: Handles data conflicts between local and remote databases
- **Queue Management**: Queues offline changes for later synchronization
- **Network Monitoring**: Automatically detects network status changes
- **Bulk Operations**: Support for bulk create, update, and delete operations
- **Search Capabilities**: Full-text search with offline fallback
- **Type Safety**: Full TypeScript support with generated types

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │  Offline Data   │    │   SQLite DB     │
│     App         │◄──►│     Layer       │◄──►│   (Local)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Sync Service  │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Supabase DB   │
                       │   (Remote)      │
                       └─────────────────┘
```

## Quick Start

### 1. Initialize the Offline Data Layer

```typescript
import { initOfflineData, initSync } from './lib/offline-data'

// In your app initialization
await initOfflineData()
await initSync()
```

### 2. Use the Data Layer

```typescript
import { OfflineDataLayer, ClientDataLayer } from './lib/offline-data'

// Create a client (works offline)
const client = await OfflineDataLayer.create('clients', {
  name: 'John Doe',
  email: 'john@example.com',
  org_id: 'org-123'
})

// Get clients (prefers online, falls back to local)
const clients = await ClientDataLayer.getClients('org-123')

// Search clients
const searchResults = await ClientDataLayer.searchClients('org-123', 'john')
```

## Data Operations

### Basic CRUD Operations

```typescript
// Create
const record = await OfflineDataLayer.create('clients', data)

// Read
const record = await OfflineDataLayer.get('clients', id)

// Update
const updated = await OfflineDataLayer.update('clients', id, changes)

// Delete
await OfflineDataLayer.delete('clients', id)
```

### List and Search

```typescript
// List with filters
const records = await OfflineDataLayer.list('clients', 
  { org_id: 'org-123', status: 'active' }, 
  'name ASC'
)

// Search
const results = await OfflineDataLayer.search('clients', 
  'search term', 
  ['name', 'email', 'phone']
)
```

### Bulk Operations

```typescript
// Bulk create
const records = await OfflineDataLayer.bulkCreate('clients', [
  { name: 'Client 1', org_id: 'org-123' },
  { name: 'Client 2', org_id: 'org-123' }
])

// Bulk update
const updated = await OfflineDataLayer.bulkUpdate('clients', [
  { id: '1', data: { status: 'active' } },
  { id: '2', data: { status: 'inactive' } }
])

// Bulk delete
await OfflineDataLayer.bulkDelete('clients', ['1', '2', '3'])
```

## Specialized Data Layers

### ClientDataLayer

```typescript
// Get all clients for organization
const clients = await ClientDataLayer.getClients('org-123')

// Get clients by status
const activeClients = await ClientDataLayer.getClients('org-123', 'active')

// Search clients
const results = await ClientDataLayer.searchClients('org-123', 'john')

// Get client with related jobs
const clientWithJobs = await ClientDataLayer.getClientWithJobs('client-123')
```

### QuoteDataLayer

```typescript
// Get quotes for organization
const quotes = await QuoteDataLayer.getQuotes('org-123')

// Get quote with items
const quoteWithItems = await QuoteDataLayer.getQuoteWithItems('quote-123')

// Create quote with items
const quote = await QuoteDataLayer.createQuoteWithItems('org-123', quoteData, items)
```

### InvoiceDataLayer

```typescript
// Get invoices for organization
const invoices = await InvoiceDataLayer.getInvoices('org-123')

// Get invoice with items and payments
const invoice = await InvoiceDataLayer.getInvoiceWithItems('invoice-123')

// Record payment
const payment = await InvoiceDataLayer.recordPayment('invoice-123', paymentData)
```

### PricebookDataLayer

```typescript
// Get pricebook items
const items = await PricebookDataLayer.getPricebookItems('org-123')

// Get items by category
const materials = await PricebookDataLayer.getPricebookItems('org-123', 'Materials')

// Get quick picks
const quickPicks = await PricebookDataLayer.getQuickPicks('org-123')

// Search pricebook
const results = await PricebookDataLayer.searchPricebook('org-123', 'pipe')
```

## Sync Management

### Manual Sync

```typescript
import { performSync, forceSyncTable } from './lib/sync'

// Perform full sync
await performSync()

// Force sync specific table
await forceSyncTable('clients')
```

### Sync Status

```typescript
import { getSyncStatus } from './lib/sync'

const status = await getSyncStatus()
console.log({
  isSyncing: status.isSyncing,
  lastSync: status.lastSync,
  pendingChanges: status.pendingChanges,
  queueSize: status.queueSize
})
```

### Conflict Resolution

```typescript
import { resolveConflict } from './lib/sync'

// Resolve conflict with server-wins strategy
await resolveConflict('clients', localRecord, serverRecord, 'server')

// Resolve conflict with local-wins strategy
await resolveConflict('clients', localRecord, serverRecord, 'local')

// Resolve conflict with merge strategy
await resolveConflict('clients', localRecord, serverRecord, 'merge')
```

## Configuration Options

### Operation Options

```typescript
// Create with options
const record = await OfflineDataLayer.create('clients', data, {
  syncImmediately: true,    // Sync immediately when online
  validateOnline: false     // Allow offline operation
})

// Update with options
const updated = await OfflineDataLayer.update('clients', id, changes, {
  syncImmediately: false,   // Don't sync immediately
  validateOnline: true      // Require online connection
})

// Get with options
const record = await OfflineDataLayer.get('clients', id, {
  preferOnline: true,       // Try online first
  fallbackToLocal: true     // Fall back to local if online fails
})
```

### Sync Configuration

```typescript
// In lib/sync.ts
const SYNC_CONFIG = {
  batchSize: 50,           // Records per sync batch
  retryLimit: 3,           // Max retry attempts
  syncInterval: 30000,     // Sync interval in ms
  conflictResolution: 'server-wins' as const
}
```

## Network Status

### Check Network Status

```typescript
import { isNetworkOnline } from './lib/offline-data'

if (isNetworkOnline()) {
  console.log('Online - can sync data')
} else {
  console.log('Offline - using local data')
}
```

### Network Event Handling

The offline data layer automatically:

- Monitors network status changes
- Triggers sync when coming back online
- Queues offline changes for later sync
- Provides fallback to local data when offline

## Data Export/Import

### Export Local Data

```typescript
import { exportLocalData } from './lib/sync'

const data = await exportLocalData()
// data is a JSON string containing all local data
```

### Import Local Data

```typescript
import { importLocalData } from './lib/sync'

await importLocalData(jsonData)
// Imports data into local SQLite database
```

### Clear Local Data

```typescript
import { clearLocalData } from './lib/sync'

await clearLocalData()
// Clears all local data (useful for logout)
```

## Error Handling

### Network Errors

```typescript
try {
  const record = await OfflineDataLayer.create('clients', data, {
    validateOnline: true
  })
} catch (error) {
  if (error.message === 'Network connection required for this operation') {
    // Handle offline scenario
    console.log('Operation requires network connection')
  }
}
```

### Sync Errors

```typescript
import { getSyncStatus } from './lib/sync'

const status = await getSyncStatus()
if (status.queueSize > 0) {
  console.log(`${status.queueSize} items waiting to sync`)
}
```

## Performance Considerations

### Batch Operations

Use bulk operations for better performance:

```typescript
// Instead of multiple individual creates
for (const item of items) {
  await OfflineDataLayer.create('clients', item)
}

// Use bulk create
await OfflineDataLayer.bulkCreate('clients', items)
```

### Sync Optimization

- Sync runs automatically every 30 seconds when online
- Only syncs changed records (uses `updated_at` timestamps)
- Processes sync queue in batches of 50 records
- Retries failed operations up to 3 times

### Local Database

- SQLite database is optimized for mobile performance
- Indexes on frequently queried columns
- Automatic cleanup of orphaned records
- Compact storage format

## Security

### Data Isolation

- All data is scoped by organization (`org_id`)
- Row Level Security (RLS) policies enforced
- Local data inherits remote security policies
- No sensitive data stored in plain text

### Sync Security

- Sync operations require authentication
- Data encrypted in transit (HTTPS)
- Local database can be encrypted (device-dependent)
- Sync queue is cleared on logout

## Troubleshooting

### Common Issues

1. **Sync not working**
   - Check network connectivity
   - Verify authentication status
   - Check sync queue for errors

2. **Data conflicts**
   - Review conflict resolution strategy
   - Manually resolve conflicts if needed
   - Check sync logs for details

3. **Performance issues**
   - Reduce sync frequency
   - Use bulk operations
   - Optimize queries with proper indexes

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('Sync status:', await getSyncStatus())
console.log('Network status:', isNetworkOnline())
```

## Best Practices

1. **Always handle offline scenarios** - Don't assume network connectivity
2. **Use appropriate options** - Set `validateOnline` for critical operations
3. **Implement proper error handling** - Gracefully handle sync failures
4. **Monitor sync status** - Show sync status to users
5. **Use bulk operations** - For better performance with large datasets
6. **Test offline functionality** - Ensure app works without network
7. **Handle conflicts appropriately** - Choose right conflict resolution strategy

## Migration Guide

### From Direct Supabase Usage

```typescript
// Before (direct Supabase)
const { data, error } = await supabase
  .from('clients')
  .insert(data)

// After (offline-first)
const record = await OfflineDataLayer.create('clients', data)
```

### From Local-Only Storage

```typescript
// Before (local only)
const record = await AsyncStorage.setItem('client', JSON.stringify(data))

// After (offline-first with sync)
const record = await OfflineDataLayer.create('clients', data)
```

## API Reference

See individual files for complete API documentation:

- `lib/sqlite.ts` - SQLite database operations
- `lib/sync.ts` - Synchronization service
- `lib/offline-data.ts` - High-level data operations
- `types/database.ts` - TypeScript type definitions
