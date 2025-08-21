-- eToolkit Seed Data
-- Trade-specific pricebook items and sample data

-- Sample organizations (these will be created by users, but we'll add some sample data)
INSERT INTO organizations (id, name, trade, size, plan, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Smith Plumbing Co', 'plumbing', 'small', 'pro', NULL),
('550e8400-e29b-41d4-a716-446655440002', 'Johnson Electrical', 'electrical', 'medium', 'pro', NULL),
('550e8400-e29b-41d4-a716-446655440003', 'Davis HVAC', 'hvac', 'solo', 'free', NULL),
('550e8400-e29b-41d4-a716-446655440004', 'Wilson Landscaping', 'landscaping', 'large', 'enterprise', NULL);

-- Plumbing Pricebook Items
INSERT INTO pricebook_items (org_id, code, name, category, unit, unit_price, taxable, is_quick_pick) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'PIPE-1/2', '1/2" Copper Pipe (10ft)', 'Materials', 'each', 15.99, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'PIPE-3/4', '3/4" Copper Pipe (10ft)', 'Materials', 'each', 22.49, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'FITTING-ELBOW', 'Copper Elbow Fitting', 'Materials', 'each', 3.99, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'FITTING-TEE', 'Copper Tee Fitting', 'Materials', 'each', 4.99, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'VALVE-BALL', 'Ball Valve 1/2"', 'Materials', 'each', 12.99, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'FAUCET-KITCHEN', 'Kitchen Faucet Installation', 'Services', 'each', 150.00, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'FAUCET-BATH', 'Bathroom Faucet Installation', 'Services', 'each', 120.00, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'TOILET-INSTALL', 'Toilet Installation', 'Services', 'each', 200.00, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'DRAIN-CLEAR', 'Drain Clearing', 'Services', 'each', 85.00, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'WATER-HEATER', 'Water Heater Installation', 'Services', 'each', 450.00, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'LABOR-HOURLY', 'Labor (Hourly)', 'Services', 'hour', 75.00, true, true),
('550e8400-e29b-41d4-a716-446655440001', 'TRIP-FEE', 'Service Call Fee', 'Services', 'each', 50.00, true, true);

-- Electrical Pricebook Items
INSERT INTO pricebook_items (org_id, code, name, category, unit, unit_price, taxable, is_quick_pick) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'WIRE-12AWG', '12 AWG Wire (100ft)', 'Materials', 'roll', 45.99, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'WIRE-14AWG', '14 AWG Wire (100ft)', 'Materials', 'roll', 35.99, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'OUTLET-STD', 'Standard Outlet', 'Materials', 'each', 8.99, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'SWITCH-SINGLE', 'Single Pole Switch', 'Materials', 'each', 6.99, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'BREAKER-15A', '15A Circuit Breaker', 'Materials', 'each', 12.99, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'BREAKER-20A', '20A Circuit Breaker', 'Materials', 'each', 14.99, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'PANEL-UPGRADE', 'Electrical Panel Upgrade', 'Services', 'each', 1200.00, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'OUTLET-INSTALL', 'Outlet Installation', 'Services', 'each', 85.00, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'LIGHT-INSTALL', 'Light Fixture Installation', 'Services', 'each', 95.00, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'CEILING-FAN', 'Ceiling Fan Installation', 'Services', 'each', 150.00, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'LABOR-HOURLY', 'Labor (Hourly)', 'Services', 'hour', 85.00, true, true),
('550e8400-e29b-41d4-a716-446655440002', 'TRIP-FEE', 'Service Call Fee', 'Services', 'each', 60.00, true, true);

-- HVAC Pricebook Items
INSERT INTO pricebook_items (org_id, code, name, category, unit, unit_price, taxable, is_quick_pick) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'FILTER-16X20', '16x20 Air Filter', 'Materials', 'each', 12.99, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'FILTER-14X20', '14x20 Air Filter', 'Materials', 'each', 10.99, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'THERMOSTAT-BASIC', 'Basic Thermostat', 'Materials', 'each', 45.99, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'THERMOSTAT-SMART', 'Smart Thermostat', 'Materials', 'each', 199.99, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'REFRIGERANT-R22', 'R22 Refrigerant (per lb)', 'Materials', 'lb', 85.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'REFRIGERANT-R410A', 'R410A Refrigerant (per lb)', 'Materials', 'lb', 65.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'AC-INSTALL', 'AC Unit Installation', 'Services', 'each', 3500.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'FURNACE-INSTALL', 'Furnace Installation', 'Services', 'each', 2800.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'MAINTENANCE', 'HVAC Maintenance', 'Services', 'each', 120.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'REPAIR-AC', 'AC Repair', 'Services', 'each', 150.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'REPAIR-FURNACE', 'Furnace Repair', 'Services', 'each', 150.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'LABOR-HOURLY', 'Labor (Hourly)', 'Services', 'hour', 95.00, true, true),
('550e8400-e29b-41d4-a716-446655440003', 'TRIP-FEE', 'Service Call Fee', 'Services', 'each', 75.00, true, true);

-- Landscaping Pricebook Items
INSERT INTO pricebook_items (org_id, code, name, category, unit, unit_price, taxable, is_quick_pick) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'SOD-PALETTE', 'Sod (per palette)', 'Materials', 'palette', 120.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'MULCH-BAG', 'Mulch (per bag)', 'Materials', 'bag', 4.99, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'SOIL-BAG', 'Top Soil (per bag)', 'Materials', 'bag', 3.99, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'TREE-SMALL', 'Small Tree', 'Materials', 'each', 85.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'TREE-MEDIUM', 'Medium Tree', 'Materials', 'each', 150.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'SHRUB-SMALL', 'Small Shrub', 'Materials', 'each', 25.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'FLOWERS-ANNUAL', 'Annual Flowers (pack)', 'Materials', 'pack', 12.99, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'LAWN-MOW', 'Lawn Mowing', 'Services', 'visit', 45.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'LAWN-FERTILIZE', 'Lawn Fertilization', 'Services', 'visit', 75.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'TREE-PLANT', 'Tree Planting', 'Services', 'each', 125.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'SHRUB-PLANT', 'Shrub Planting', 'Services', 'each', 35.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'LANDSCAPE-DESIGN', 'Landscape Design', 'Services', 'project', 500.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'IRRIGATION-INSTALL', 'Irrigation Installation', 'Services', 'zone', 250.00, true, true),
('550e8400-e29b-41d4-a716-446655440004', 'LABOR-HOURLY', 'Labor (Hourly)', 'Services', 'hour', 45.00, true, true);

-- Sample settings for each organization
INSERT INTO settings (org_id, currency, default_tax_pct, numbering_prefix_quote, numbering_prefix_invoice, legal_name, terms_default) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'USD', 8.25, 'Q', 'INV', 'Smith Plumbing Co', 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.'),
('550e8400-e29b-41d4-a716-446655440002', 'USD', 8.25, 'Q', 'INV', 'Johnson Electrical', 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.'),
('550e8400-e29b-41d4-a716-446655440003', 'USD', 8.25, 'Q', 'INV', 'Davis HVAC', 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.'),
('550e8400-e29b-41d4-a716-446655440004', 'USD', 8.25, 'Q', 'INV', 'Wilson Landscaping', 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.');

-- Sample clients for each organization
INSERT INTO clients (org_id, name, phone, email, address_line1, city, state, postal, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Smith', '555-0101', 'john@example.com', '123 Main St', 'Austin', 'TX', '78701', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', '555-0102', 'sarah@example.com', '456 Oak Ave', 'Austin', 'TX', '78702', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Mike Davis', '555-0201', 'mike@example.com', '789 Pine St', 'Austin', 'TX', '78703', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Lisa Wilson', '555-0202', 'lisa@example.com', '321 Elm St', 'Austin', 'TX', '78704', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Tom Brown', '555-0301', 'tom@example.com', '654 Maple Dr', 'Austin', 'TX', '78705', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Amy Garcia', '555-0302', 'amy@example.com', '987 Cedar Ln', 'Austin', 'TX', '78706', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'David Miller', '555-0401', 'david@example.com', '147 Birch Rd', 'Austin', 'TX', '78707', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'Jennifer Taylor', '555-0402', 'jennifer@example.com', '258 Spruce Way', 'Austin', 'TX', '78708', 'active');

-- Sample jobs
INSERT INTO jobs (org_id, client_id, title, description, status, due_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM clients WHERE name = 'John Smith' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), 'Kitchen Sink Repair', 'Replace kitchen sink faucet and fix leak under sink', 'in_progress', CURRENT_DATE + INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM clients WHERE name = 'Mike Davis' AND org_id = '550e8400-e29b-41d4-a716-446655440002'), 'Electrical Panel Upgrade', 'Upgrade electrical panel from 100A to 200A', 'pending', CURRENT_DATE + INTERVAL '7 days'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM clients WHERE name = 'Tom Brown' AND org_id = '550e8400-e29b-41d4-a716-446655440003'), 'AC Maintenance', 'Annual AC maintenance and filter replacement', 'completed', CURRENT_DATE - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM clients WHERE name = 'David Miller' AND org_id = '550e8400-e29b-41d4-a716-446655440004'), 'Landscape Design', 'Complete landscape design and installation for new home', 'in_progress', CURRENT_DATE + INTERVAL '14 days');

-- Sample quotes
INSERT INTO quotes (org_id, number, client_id, job_id, status, subtotal, tax_total, total, valid_until) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Q001', (SELECT id FROM clients WHERE name = 'John Smith' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), (SELECT id FROM jobs WHERE title = 'Kitchen Sink Repair' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), 'sent', 225.00, 18.56, 243.56, CURRENT_DATE + INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440002', 'Q001', (SELECT id FROM clients WHERE name = 'Mike Davis' AND org_id = '550e8400-e29b-41d4-a716-446655440002'), (SELECT id FROM jobs WHERE title = 'Electrical Panel Upgrade' AND org_id = '550e8400-e29b-41d4-a716-446655440002'), 'draft', 1200.00, 99.00, 1299.00, CURRENT_DATE + INTERVAL '30 days');

-- Sample quote items
INSERT INTO quote_items (quote_id, description, quantity, unit_price, line_total) VALUES
((SELECT id FROM quotes WHERE number = 'Q001' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), 'Kitchen Faucet Installation', 1, 150.00, 150.00),
((SELECT id FROM quotes WHERE number = 'Q001' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), 'Kitchen Faucet (Premium)', 1, 75.00, 75.00),
((SELECT id FROM quotes WHERE number = 'Q001' AND org_id = '550e8400-e29b-41d4-a716-446655440002'), 'Electrical Panel Upgrade', 1, 1200.00, 1200.00);

-- Sample invoices
INSERT INTO invoices (org_id, number, client_id, job_id, status, subtotal, tax_total, total, balance_due, issue_date, due_date) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'INV001', (SELECT id FROM clients WHERE name = 'Tom Brown' AND org_id = '550e8400-e29b-41d4-a716-446655440003'), (SELECT id FROM jobs WHERE title = 'AC Maintenance' AND org_id = '550e8400-e29b-41d4-a716-446655440003'), 'paid', 120.00, 9.90, 129.90, 0.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440004', 'INV001', (SELECT id FROM clients WHERE name = 'David Miller' AND org_id = '550e8400-e29b-41d4-a716-446655440004'), (SELECT id FROM jobs WHERE title = 'Landscape Design' AND org_id = '550e8400-e29b-41d4-a716-446655440004'), 'sent', 500.00, 41.25, 541.25, 541.25, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days');

-- Sample invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, line_total) VALUES
((SELECT id FROM invoices WHERE number = 'INV001' AND org_id = '550e8400-e29b-41d4-a716-446655440003'), 'HVAC Maintenance', 1, 120.00, 120.00),
((SELECT id FROM invoices WHERE number = 'INV001' AND org_id = '550e8400-e29b-41d4-a716-446655440004'), 'Landscape Design', 1, 500.00, 500.00);

-- Sample payment
INSERT INTO payments (invoice_id, method, amount, note) VALUES
((SELECT id FROM invoices WHERE number = 'INV001' AND org_id = '550e8400-e29b-41d4-a716-446655440003'), 'check', 129.90, 'Check #1234');

-- Sample activities
INSERT INTO activities (org_id, entity_type, entity_id, action, meta) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'quote', (SELECT id FROM quotes WHERE number = 'Q001' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), 'created', '{"amount": 243.56}'),
('550e8400-e29b-41d4-a716-446655440001', 'quote', (SELECT id FROM quotes WHERE number = 'Q001' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), 'sent', '{"sent_at": "' || NOW() || '"}'),
('550e8400-e29b-41d4-a716-446655440003', 'invoice', (SELECT id FROM invoices WHERE number = 'INV001' AND org_id = '550e8400-e29b-41d4-a716-446655440003'), 'paid', '{"amount": 129.90}'),
('550e8400-e29b-41d4-a716-446655440004', 'invoice', (SELECT id FROM invoices WHERE number = 'INV001' AND org_id = '550e8400-e29b-41d4-a716-446655440004'), 'sent', '{"sent_at": "' || NOW() || '"}');

-- Sample reminders
INSERT INTO reminders (org_id, entity_type, entity_id, title, due_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'job', (SELECT id FROM jobs WHERE title = 'Kitchen Sink Repair' AND org_id = '550e8400-e29b-41d4-a716-446655440001'), 'Follow up on kitchen sink repair', CURRENT_DATE + INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440002', 'quote', (SELECT id FROM quotes WHERE number = 'Q001' AND org_id = '550e8400-e29b-41d4-a716-446655440002'), 'Follow up on electrical panel quote', CURRENT_DATE + INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440004', 'invoice', (SELECT id FROM invoices WHERE number = 'INV001' AND org_id = '550e8400-e29b-41d4-a716-446655440004'), 'Send payment reminder', CURRENT_DATE + INTERVAL '15 days');
