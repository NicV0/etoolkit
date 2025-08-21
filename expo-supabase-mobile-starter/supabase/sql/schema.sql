-- eToolkit Database Schema
-- Multi-tenant CRM system for trade businesses

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect');
CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'expired');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cash', 'check', 'credit_card', 'bank_transfer', 'other');
CREATE TYPE template_type AS ENUM ('quote', 'invoice', 'receipt');
CREATE TYPE activity_action AS ENUM ('created', 'updated', 'deleted', 'sent', 'viewed', 'paid');

-- Core multi-tenant structure
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    trade TEXT NOT NULL,
    size TEXT CHECK (size IN ('solo', 'small', 'medium', 'large')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    display_name TEXT,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, org_id)
);

-- Business data
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal TEXT,
    country TEXT DEFAULT 'US',
    notes TEXT,
    status client_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status job_status DEFAULT 'pending',
    due_date DATE,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    path TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing system
CREATE TABLE pricebook_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT DEFAULT 'each',
    unit_price DECIMAL(10,2) NOT NULL,
    taxable BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    is_quick_pick BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    status quote_status DEFAULT 'draft',
    currency TEXT DEFAULT 'USD',
    tax_rate_pct DECIMAL(5,2) DEFAULT 0,
    discount_amt DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_total DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    terms TEXT,
    valid_until DATE,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, number)
);

CREATE TABLE quote_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_id UUID REFERENCES pricebook_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    taxable BOOLEAN DEFAULT true,
    line_total DECIMAL(10,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    status invoice_status DEFAULT 'draft',
    currency TEXT DEFAULT 'USD',
    tax_rate_pct DECIMAL(5,2) DEFAULT 0,
    discount_amt DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_total DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) DEFAULT 0,
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, number)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_id UUID REFERENCES pricebook_items(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    taxable BOOLEAN DEFAULT true,
    line_total DECIMAL(10,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    method payment_method NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    note TEXT,
    external_id TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configuration
CREATE TABLE settings (
    org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'USD',
    default_tax_pct DECIMAL(5,2) DEFAULT 0,
    numbering_prefix_quote TEXT DEFAULT 'Q',
    numbering_prefix_invoice TEXT DEFAULT 'INV',
    logo_url TEXT,
    legal_name TEXT,
    address_json JSONB,
    terms_default TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type template_type NOT NULL,
    name TEXT NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    content_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action activity_action NOT NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    title TEXT NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    done BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_clients_org_status ON clients(org_id, status);
CREATE INDEX idx_clients_org_name ON clients(org_id, name);
CREATE INDEX idx_jobs_org_status ON jobs(org_id, status);
CREATE INDEX idx_jobs_org_due_date ON jobs(org_id, due_date);
CREATE INDEX idx_jobs_org_client ON jobs(org_id, client_id);
CREATE INDEX idx_quotes_org_status ON quotes(org_id, status);
CREATE INDEX idx_quotes_org_created ON quotes(org_id, created_at);
CREATE INDEX idx_quotes_org_client ON quotes(org_id, client_id);
CREATE INDEX idx_invoices_org_status ON invoices(org_id, status);
CREATE INDEX idx_invoices_org_due_date ON invoices(org_id, due_date);
CREATE INDEX idx_invoices_org_client ON invoices(org_id, client_id);
CREATE INDEX idx_invoices_org_created ON invoices(org_id, created_at);
CREATE INDEX idx_pricebook_org_active ON pricebook_items(org_id, active);
CREATE INDEX idx_pricebook_org_category ON pricebook_items(org_id, category);
CREATE INDEX idx_pricebook_org_quick_pick ON pricebook_items(org_id, is_quick_pick);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_activities_org_entity ON activities(org_id, entity_type, entity_id);
CREATE INDEX idx_activities_org_created ON activities(org_id, created_at);
CREATE INDEX idx_reminders_org_due ON reminders(org_id, due_at);
CREATE INDEX idx_reminders_org_done ON reminders(org_id, done);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricebook_items_updated_at BEFORE UPDATE ON pricebook_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Payment triggers to recompute balance_due
CREATE OR REPLACE FUNCTION update_invoice_balance_due()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE invoices 
        SET balance_due = total - COALESCE((
            SELECT SUM(amount) FROM payments WHERE invoice_id = NEW.invoice_id
        ), 0)
        WHERE id = NEW.invoice_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE invoices 
        SET balance_due = total - COALESCE((
            SELECT SUM(amount) FROM payments WHERE invoice_id = OLD.invoice_id
        ), 0)
        WHERE id = OLD.invoice_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoice_balance_on_payment 
    AFTER INSERT OR DELETE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_invoice_balance_due();

-- RLS Helper Functions
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND org_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_owner(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() AND org_id = $1 AND role = 'owner'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricebook_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Organizations: Users can only access organizations they're members of
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (is_org_member(id));

CREATE POLICY "Users can update their organizations" ON organizations
    FOR UPDATE USING (is_org_member(id));

CREATE POLICY "Users can insert organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Clients: Users can only access clients in their organization
CREATE POLICY "Users can view org clients" ON clients
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org clients" ON clients
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org clients" ON clients
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org clients" ON clients
    FOR DELETE USING (is_org_member(org_id));

-- Jobs: Users can only access jobs in their organization
CREATE POLICY "Users can view org jobs" ON jobs
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org jobs" ON jobs
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org jobs" ON jobs
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org jobs" ON jobs
    FOR DELETE USING (is_org_member(org_id));

-- Documents: Users can only access documents in their organization
CREATE POLICY "Users can view org documents" ON documents
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org documents" ON documents
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org documents" ON documents
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org documents" ON documents
    FOR DELETE USING (is_org_member(org_id));

-- Pricebook items: Users can only access items in their organization
CREATE POLICY "Users can view org pricebook items" ON pricebook_items
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org pricebook items" ON pricebook_items
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org pricebook items" ON pricebook_items
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org pricebook items" ON pricebook_items
    FOR DELETE USING (is_org_member(org_id));

-- Quotes: Users can only access quotes in their organization
CREATE POLICY "Users can view org quotes" ON quotes
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org quotes" ON quotes
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org quotes" ON quotes
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org quotes" ON quotes
    FOR DELETE USING (is_org_member(org_id));

-- Quote items: Users can only access items for quotes in their organization
CREATE POLICY "Users can view org quote items" ON quote_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM quotes WHERE id = quote_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can insert org quote items" ON quote_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM quotes WHERE id = quote_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can update org quote items" ON quote_items
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM quotes WHERE id = quote_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can delete org quote items" ON quote_items
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM quotes WHERE id = quote_id AND is_org_member(org_id))
    );

-- Invoices: Users can only access invoices in their organization
CREATE POLICY "Users can view org invoices" ON invoices
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org invoices" ON invoices
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org invoices" ON invoices
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org invoices" ON invoices
    FOR DELETE USING (is_org_member(org_id));

-- Invoice items: Users can only access items for invoices in their organization
CREATE POLICY "Users can view org invoice items" ON invoice_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can insert org invoice items" ON invoice_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can update org invoice items" ON invoice_items
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can delete org invoice items" ON invoice_items
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

-- Payments: Users can only access payments for invoices in their organization
CREATE POLICY "Users can view org payments" ON payments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can insert org payments" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can update org payments" ON payments
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

CREATE POLICY "Users can delete org payments" ON payments
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND is_org_member(org_id))
    );

-- Settings: Users can only access settings in their organization
CREATE POLICY "Users can view org settings" ON settings
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org settings" ON settings
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org settings" ON settings
    FOR UPDATE USING (is_org_member(org_id));

-- Templates: Users can only access templates in their organization
CREATE POLICY "Users can view org templates" ON templates
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org templates" ON templates
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org templates" ON templates
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org templates" ON templates
    FOR DELETE USING (is_org_member(org_id));

-- Activities: Users can only access activities in their organization
CREATE POLICY "Users can view org activities" ON activities
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org activities" ON activities
    FOR INSERT WITH CHECK (is_org_member(org_id));

-- Reminders: Users can only access reminders in their organization
CREATE POLICY "Users can view org reminders" ON reminders
    FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "Users can insert org reminders" ON reminders
    FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "Users can update org reminders" ON reminders
    FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "Users can delete org reminders" ON reminders
    FOR DELETE USING (is_org_member(org_id));
