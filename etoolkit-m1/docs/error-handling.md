# Error Handling (M1)
- Network/API errors → show friendly Alert; log details to console (Sentry later).
- Validation: block save if required fields missing (client phone; at least one line with qty > 0).
- Parsing: coerce numeric inputs safely (default 0 when blank).
- Export: catch `expo-print` failures; alert with retry suggestion.
