# etoolkit

## Database

Apply the SQL files to create the jobs/tasks/schedule schema and policies:

```
psql <connection> -f supabase/sql/m3_jobs_tasks_schema.sql
psql <connection> -f supabase/sql/m3_jobs_tasks_rls.sql
```

## Offline testing

1. Run the mobile app and sign in.
2. Create a Job and Schedule Event online; verify they appear in the database.
3. Enable airplane mode and create another Job/Event. The app will report "Queued offline".
4. Go back online and trigger the outbox drain (on resume or a button) to send queued writes.

## Tests

Run unit tests with:

```
npm test
```
