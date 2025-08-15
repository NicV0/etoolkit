-- Allow select on view via underlying table policies (no direct RLS needed on view)
-- Ensure realtime works: grants are handled at table level; nothing extra if Realtime is enabled for schema.

-- Update policies to permit versioned updates (no change needed functionally; optimistic check is app-side).
-- (If you added extra policies earlier, keep them.)
