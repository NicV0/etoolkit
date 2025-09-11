-- Phase 3 Additions

-- D3-2: Discount support for document line items
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discount_type') THEN
    CREATE TYPE discount_type AS ENUM ('none','amount','percent');
  END IF;
END $$;

ALTER TABLE IF EXISTS quote_items
  ADD COLUMN IF NOT EXISTS discount_type discount_type DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS discount_value_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;

ALTER TABLE IF EXISTS invoice_items
  ADD COLUMN IF NOT EXISTS discount_type discount_type DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS discount_value_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;

-- D3-3: Document counters per org/type/year
CREATE TABLE IF NOT EXISTS document_counters (
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('quote','invoice')),
  year INTEGER NOT NULL,
  current INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (org_id, doc_type, year)
);

CREATE OR REPLACE FUNCTION next_document_number(p_org UUID, p_type TEXT)
RETURNS TEXT AS $$
DECLARE
  y INTEGER := EXTRACT(YEAR FROM NOW());
  seq INTEGER;
  prefix TEXT;
BEGIN
  INSERT INTO document_counters (org_id, doc_type, year, current)
  VALUES (p_org, p_type, y, 0)
  ON CONFLICT (org_id, doc_type, year) DO NOTHING;

  UPDATE document_counters
  SET current = current + 1
  WHERE org_id = p_org AND doc_type = p_type AND year = y
  RETURNING current INTO seq;

  IF p_type = 'quote' THEN
    SELECT COALESCE(numbering_prefix_quote, 'Q') INTO prefix FROM settings WHERE org_id = p_org;
  ELSE
    SELECT COALESCE(numbering_prefix_invoice, 'INV') INTO prefix FROM settings WHERE org_id = p_org;
  END IF;

  RETURN prefix || to_char(y, 'YYYY') || LPAD(seq::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- D3-4: Views
CREATE OR REPLACE VIEW v_outstanding_invoices AS
SELECT * FROM invoices WHERE status IN ('sent','overdue') AND balance_due > 0;

CREATE OR REPLACE VIEW v_paid_this_month AS
SELECT org_id, date_trunc('month', received_at) AS month, SUM(amount) AS total
FROM payments
WHERE date_trunc('month', received_at) = date_trunc('month', NOW())
GROUP BY org_id, month;

-- D3-7: Quota tables
CREATE TABLE IF NOT EXISTS usage_exports (
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, occurred_at)
);

CREATE TABLE IF NOT EXISTS usage_ai (
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (org_id, occurred_at)
);

ALTER TABLE usage_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can insert org usage_exports" ON usage_exports
  FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY IF NOT EXISTS "Users can view org usage_exports" ON usage_exports
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY IF NOT EXISTS "Users can insert org usage_ai" ON usage_ai
  FOR INSERT WITH CHECK (is_org_member(org_id));
CREATE POLICY IF NOT EXISTS "Users can view org usage_ai" ON usage_ai
  FOR SELECT USING (is_org_member(org_id));

-- D3-8: Storage usage tracking
DO $$ BEGIN
  BEGIN
    ALTER TABLE organizations ADD COLUMN storage_used_bytes BIGINT DEFAULT 0;
  EXCEPTION WHEN duplicate_column THEN
    -- ignore
  END;
END $$;

CREATE OR REPLACE FUNCTION inc_storage_used() RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations SET storage_used_bytes = storage_used_bytes + NEW.size WHERE id = NEW.org_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION dec_storage_used() RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations SET storage_used_bytes = storage_used_bytes - OLD.size WHERE id = OLD.org_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inc_storage_used ON documents;
CREATE TRIGGER trg_inc_storage_used AFTER INSERT ON documents FOR EACH ROW EXECUTE FUNCTION inc_storage_used();

DROP TRIGGER IF EXISTS trg_dec_storage_used ON documents;
CREATE TRIGGER trg_dec_storage_used AFTER DELETE ON documents FOR EACH ROW EXECUTE FUNCTION dec_storage_used();

-- D3-10: Allowed MIME/type guard
CREATE OR REPLACE FUNCTION validate_document_mime() RETURNS TRIGGER AS $$
DECLARE
  allowed TEXT[] := ARRAY['application/pdf','image/png','image/jpeg'];
BEGIN
  IF NOT (NEW.mime = ANY(allowed)) THEN
    RAISE EXCEPTION 'MIME type % is not allowed', NEW.mime;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_document_mime ON documents;
CREATE TRIGGER trg_validate_document_mime BEFORE INSERT OR UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION validate_document_mime();
