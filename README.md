# etoolkit

## KitAI Cloud Mode

Deploy `supabase/functions/kitai-proxy` and set `OPENAI_API_KEY` to enable cloud answers. Without the key the mobile app stays offline only.

## Prompt Budget

KitAI retrieves up to a handful of documents and keeps prompts under ~2kB to limit latency and cost when cloud mode is enabled.

## Privacy Controls

Org data stays on-device unless cloud mode is explicitly enabled. Shared messages are redacted for emails and phone numbers.
