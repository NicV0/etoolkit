-- Migration 001: Initial Schema
-- Creates all core tables for the app

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    tax_exempt BOOLEAN DEFAULT FALSE,
    default_terms TEXT DEFAULT 'net30',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    version INTEGER DEFAULT 1
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    number TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value REAL DEFAULT 0,
    tax_rate REAL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    due_date TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Drafts table for wizard autosave
CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('invoice', 'quote', 'client')),
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Templates table for document templates
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('invoice', 'quote', 'contract')),
    version INTEGER NOT NULL DEFAULT 1,
    name TEXT NOT NULL,
    html TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_deprecated BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    meta_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sync outbox table for offline queue
CREATE TABLE IF NOT EXISTS sync_outbox (
    id TEXT PRIMARY KEY,
    op TEXT NOT NULL CHECK (op IN ('create', 'update', 'delete')),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    dependency_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (dependency_id) REFERENCES sync_outbox(id)
);

-- Messages table for KitAI chat
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON clients(deleted_at);

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(number);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_drafts_type ON drafts(type);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at);

CREATE INDEX IF NOT EXISTS idx_templates_type_version ON templates(type, version);
CREATE INDEX IF NOT EXISTS idx_templates_default ON templates(type, is_default) WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_sync_outbox_status ON sync_outbox(status);
CREATE INDEX IF NOT EXISTS idx_sync_outbox_dependency ON sync_outbox(dependency_id);
CREATE INDEX IF NOT EXISTS idx_sync_outbox_entity ON sync_outbox(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Insert default templates
INSERT OR IGNORE INTO templates (id, type, version, name, html, is_default) VALUES
('invoice_default_v1', 'invoice', 1, 'Default Invoice', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        .client-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { text-align: right; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE</h1>
        <p>Invoice #{{invoice_number}}</p>
        <p>Date: {{invoice_date}}</p>
    </div>
    
    <div class="client-details">
        <h3>Bill To:</h3>
        <p>{{client_name}}</p>
        <p>{{client_email}}</p>
        <p>{{client_address}}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            {{#items}}
            <tr>
                <td>{{description}}</td>
                <td>{{quantity}}</td>
                <td>${{unit_price}}</td>
                <td>${{total}}</td>
            </tr>
            {{/items}}
        </tbody>
    </table>
    
    <div class="total">
        <p>Subtotal: ${{subtotal}}</p>
        {{#tax_rate}}
        <p>Tax ({{tax_rate}}%): ${{tax_amount}}</p>
        {{/tax_rate}}
        {{#discount}}
        <p>Discount: ${{discount_amount}}</p>
        {{/discount}}
        <p><strong>Total: ${{total}}</strong></p>
    </div>
</body>
</html>', TRUE),

('quote_default_v1', 'quote', 1, 'Default Quote',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quote</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .quote-details { margin-bottom: 20px; }
        .client-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { text-align: right; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>QUOTE</h1>
        <p>Quote #{{quote_number}}</p>
        <p>Date: {{quote_date}}</p>
        <p>Valid Until: {{valid_until}}</p>
    </div>
    
    <div class="client-details">
        <h3>For:</h3>
        <p>{{client_name}}</p>
        <p>{{client_email}}</p>
        <p>{{client_address}}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            {{#items}}
            <tr>
                <td>{{description}}</td>
                <td>{{quantity}}</td>
                <td>${{unit_price}}</td>
                <td>${{total}}</td>
            </tr>
            {{/items}}
        </tbody>
    </table>
    
    <div class="total">
        <p>Subtotal: ${{subtotal}}</p>
        {{#tax_rate}}
        <p>Tax ({{tax_rate}}%): ${{tax_amount}}</p>
        {{/tax_rate}}
        {{#discount}}
        <p>Discount: ${{discount_amount}}</p>
        {{/discount}}
        <p><strong>Total: ${{total}}</strong></p>
    </div>
    
    <div style="margin-top: 30px;">
        <h3>Terms & Conditions:</h3>
        <p>This quote is valid for 30 days from the date of issue.</p>
        <p>Payment terms: Net 30 days</p>
    </div>
</body>
</html>', TRUE);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value_json) VALUES
('organization', '{"name": "My Business", "logo": null, "accent_color": "#2563EB"}'),
('business_profile', '{"address": "", "phone": "", "website": "", "ein": ""}'),
('defaults', '{"invoice_prefix": "INV-", "quote_prefix": "QTE-", "payment_terms": "net30", "currency": "USD", "tax_rate": 0}'),
('notifications', '{"sync_failures": true, "payment_reminders": true, "invoice_sent": true, "invoice_paid": true}'),
('backup', '{"auto_backup": true, "backup_frequency": "daily", "keep_backups": 7}'),
('experimental', '{"beta_features": false}');


