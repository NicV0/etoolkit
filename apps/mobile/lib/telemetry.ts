// No‑op if keys are missing. Call initTelemetry() once in the app root.
export function initTelemetry() {
  try {
    // Optional: Sentry
    // @ts-ignore - import only if added to project
    // Sentry.init({ dsn: process.env.SENTRY_DSN, enableNative: true });
  } catch {}
}

export function track(event: string, props?: Record<string, any>) {
  try {
    // Optional: PostHog
    // posthog?.capture?.(event, props);
    // Fallback console log in dev
    if (__DEV__) console.log('[track]', event, props || {});
  } catch {}
}
