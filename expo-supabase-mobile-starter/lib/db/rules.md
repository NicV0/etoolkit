# Database Rules & RLS Policies

## Overview

This document outlines the Row Level Security (RLS) policies and database access patterns for the eToolkit CRM system.

## Multi-Tenant Architecture

All data is scoped by `org_id` (organization ID). Users can only access data within organizations they are members of.

## RLS Helper Functions

### `is_org_member(org_id UUID)`
Returns `true` if the current user is a member of the specified organization.

### `is_org_owner(org_id UUID)`
Returns `true` if the current user is the owner of the specified organization.

## Table Access Patterns

### Organizations
- **View**: Users can view organizations they're members of
- **Update**: Users can update organizations they're members of
- **Insert**: Users can create organizations (becomes owner)

### Profiles
- **View**: Users can only view their own profile
- **Update**: Users can only update their own profile
- **Insert**: Users can only insert their own profile

### Business Data (Clients, Jobs, Documents)
- **View**: Users can view data in their organizations
- **Insert**: Users can insert data in their organizations
- **Update**: Users can update data in their organizations
- **Delete**: Users can delete data in their organizations

### Billing Data (Quotes, Invoices, Pricebook Items)
- **View**: Users can view billing data in their organizations
- **Insert**: Users can insert billing data in their organizations
- **Update**: Users can update billing data in their organizations
- **Delete**: Users can delete billing data in their organizations

### Line Items (Quote Items, Invoice Items)
- **View**: Users can view items for quotes/invoices in their organizations
- **Insert**: Users can insert items for quotes/invoices in their organizations
- **Update**: Users can update items for quotes/invoices in their organizations
- **Delete**: Users can delete items for quotes/invoices in their organizations

### Payments
- **View**: Users can view payments for invoices in their organizations
- **Insert**: Users can insert payments for invoices in their organizations
- **Update**: Users can update payments for invoices in their organizations
- **Delete**: Users can delete payments for invoices in their organizations

### Configuration (Settings, Templates)
- **View**: Users can view configuration in their organizations
- **Insert**: Users can insert configuration in their organizations
- **Update**: Users can update configuration in their organizations
- **Delete**: Users can delete templates in their organizations (settings are org-specific)

### Activities & Reminders
- **View**: Users can view activities/reminders in their organizations
- **Insert**: Users can insert activities/reminders in their organizations
- **Update**: Users can update reminders in their organizations
- **Delete**: Users can delete reminders in their organizations

## Data Access Patterns

### Client Access
```sql
-- Get all clients for user's organization
SELECT * FROM clients WHERE org_id IN (
  SELECT org_id FROM profiles WHERE user_id = auth.uid()
);

-- Get specific client (with RLS)
SELECT * FROM clients WHERE id = $1;
```

### Quote Access
```sql
-- Get all quotes for user's organization
SELECT * FROM quotes WHERE org_id IN (
  SELECT org_id FROM profiles WHERE user_id = auth.uid()
);

-- Get quote with items
SELECT q.*, qi.* 
FROM quotes q 
LEFT JOIN quote_items qi ON q.id = qi.quote_id 
WHERE q.id = $1;
```

### Invoice Access
```sql
-- Get all invoices for user's organization
SELECT * FROM invoices WHERE org_id IN (
  SELECT org_id FROM profiles WHERE user_id = auth.uid()
);

-- Get invoice with items and payments
SELECT i.*, ii.*, p.* 
FROM invoices i 
LEFT JOIN invoice_items ii ON i.id = ii.invoice_id 
LEFT JOIN payments p ON i.id = p.invoice_id 
WHERE i.id = $1;
```

## Security Considerations

### Data Isolation
- All queries must include `org_id` filtering
- RLS policies enforce organization-level access
- No cross-organization data access possible

### User Permissions
- Users can only access organizations they're members of
- Profile data is user-specific
- Organization owners have full access to their org data

### Audit Trail
- All activities are logged with `org_id` and `actor_id`
- Activities table tracks all data changes
- Reminders can be set for follow-ups

## Performance Considerations

### Indexes
- All foreign keys have indexes
- Composite indexes on `(org_id, status)` for filtering
- Composite indexes on `(org_id, created_at)` for sorting
- Composite indexes on `(org_id, due_date)` for date filtering

### Query Optimization
- Use `org_id` in WHERE clauses for RLS efficiency
- Avoid subqueries when possible
- Use appropriate indexes for common query patterns

## Plan Gating

### Quick Picks Limit
- Free plan: 5 quick picks
- Pro plan: 25 quick picks
- Enterprise plan: Unlimited quick picks

### Storage Limits
- Free plan: 100MB
- Pro plan: 1GB
- Enterprise plan: 10GB

### API Rate Limits
- Free plan: 100 requests/hour
- Pro plan: 1000 requests/hour
- Enterprise plan: 10000 requests/hour

## Backup & Recovery

### Data Backup
- Daily automated backups
- Point-in-time recovery available
- Cross-region replication for enterprise

### Disaster Recovery
- RTO: 4 hours
- RPO: 1 hour
- Automated failover for enterprise

## Compliance

### Data Privacy
- All data encrypted at rest
- All data encrypted in transit
- GDPR compliance for EU users
- CCPA compliance for California users

### Data Retention
- Active data: Indefinite
- Deleted data: 30 days (soft delete)
- Audit logs: 7 years
- Backup retention: 90 days
