# Manual Test Checklist (M1)

## Auth + Bootstrap
- [ ] Launch app, enter email, receive magic link.
- [ ] Tap magic link → app opens, session established.
- [ ] Org bootstraps: app obtains `orgId` (first run creates, subsequent runs reuse).

## Clients
- [ ] Add client with name+phone: appears in list; DB row created.
- [ ] Try to add client without phone: UI blocks with validation.

## Quotes
- [ ] Build draft with ≥1 item; set tax %, terms, contract.
- [ ] Save Draft: rows appear in `quotes` + `quote_items`.
- [ ] Preview → Export: PDF opens/share sheet works; QUOTE chip + initials square visible.

## RLS sanity
- [ ] Using another user, verify other org’s rows are not visible or writable.

## Logging/Telemetry (no‑op ok)
- [ ] Console shows structured logs for key actions (login, org_bootstrap, client_created, quote_saved, pdf_exported).
