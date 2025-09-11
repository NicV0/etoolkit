---
description: Prevents divergence between multiple theme modules and ensures all
  UI components share the same design tokens.
---

Use expo-supabase-mobile-starter/lib/theme/tokens.ts as the single source of truth for theme variables (colors, typography, spacing, radii, shadows, z-index, animation). Do not import from lib/theme/index.ts; use tokens.ts exports instead.