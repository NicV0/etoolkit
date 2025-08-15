# etoolkit

## Apply M2 schema & RLS

```bash
psql < supabase/sql/m2_invoices_schema.sql
psql < supabase/sql/m2_invoices_rls.sql
```

## Run the app and test flows

```bash
cd apps/mobile
npm start
# Create a quote, then Convert to Invoice, preview & export
```
