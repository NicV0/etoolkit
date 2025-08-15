# etoolkit
## Email & Public Links

To enable real email delivery, configure the `RESEND_API_KEY` secret for the `email-dispatch` function. Without it, emails are logged and `{ ok: true, test: true }` is returned.

Set `EXPO_PUBLIC_FUNCTIONS_URL` in the mobile app to your Supabase Functions base URL (e.g., `https://xyz.functions.supabase.co`). Public links use this base to form shareable URLs.

### Security Notes

Public links are bearer tokens that expire after their TTL. Delete a link row to revoke access immediately.
