# Deploy with Supabase Postgres and Railway

This repository contains a Django REST API in `back-end/` and a Vite/React
single-page app in `front-end/homefront/`. SQLite remains the local development
default. Production Django settings require a PostgreSQL `DATABASE_URL`.

The instructions below deploy the API and frontend as separate Railway
services, with Supabase providing PostgreSQL. Railway Free is appropriate for a
preview or low-traffic demo. Its current allowance is $1 of Railway usage per
month, with up to 0.5 GB RAM and one replica per service; it is not a dependable
production budget for two always-on services. Check current plan limits before
launching, and expect service interruption if the usage allowance is exhausted.

## 1. Create the Supabase database

1. Create a Supabase project in a region near the Railway services.
2. Save the database password securely.
3. In the Supabase dashboard, open **Connect** and copy the **Session pooler**
   URI. Railway may need an IPv4-reachable endpoint; Supabase direct connections
   are IPv6 unless the project has IPv4 connectivity enabled. The session pooler
   supports long-running Django/Gunicorn processes and prepared statements.
4. Replace the password placeholder. URL-encode reserved characters in the
   password. Keep this value private; it will be added to Railway as
   `DATABASE_URL`.

Use the URI copied from the Supabase dashboard rather than constructing the
pooler hostname or username. Avoid the Transaction pooler for this persistent
Django service. Supabase recommends that mode for serverless connections and
it has session-feature limitations.

## 2. Deploy the Django API to Railway

Create a Railway project and add a service from this GitHub repository. Set its
**Root Directory** to `/back-end`. Configure the service as follows:

| Setting | Value |
|---|---|
| Build command | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| Pre-deploy command | `python manage.py migrate` |
| Start command | Use the committed `Procfile` (`gunicorn` on Railway's `$PORT`) |
| Healthcheck path | `/health/` |

Generate a public Railway domain for the API. Add these service variables in
Railway (set Stripe and email values even for the initial production-mode
deployment; Django validates them at startup):

```text
DEBUG=False
SECRET_KEY=<at least 50 random characters generated for this deployment>
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_BASE_URL=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
DATABASE_URL=<Supabase Session pooler URI>
STRIPE_SECRET_KEY=<Stripe test secret for staging, live secret only at launch>
STRIPE_WEBHOOK_SECRET=<matching Stripe webhook signing secret>
EMAIL_HOST=<SMTP provider host>
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<SMTP username>
EMAIL_HOST_PASSWORD=<SMTP password>
DEFAULT_FROM_EMAIL=<verified sender address>
```

Replace `Frontend` in the Railway reference with the exact name of the frontend
service. If you use custom domains, include the API domain and any custom API
domain in `ALLOWED_HOSTS` (comma-separated, without schemes), and set
`FRONTEND_BASE_URL` to the frontend's HTTPS origin. Railway reference variables
are available to the build and runtime environments.

Set `OPENAI_API_KEY` only if the optional AI features are enabled. Never put
database, Stripe, SMTP, Django, or OpenAI secrets in a `VITE_*` variable.

## 3. Deploy the React frontend to Railway

Add another service from the same repository and set its **Root Directory** to
`/front-end/homefront`. Use:

| Setting | Value |
|---|---|
| Build command | `npm ci && npm run build` |
| Start command | `node server.mjs` |
| Healthcheck path | `/health/` |

The included Node server serves the built Vite assets, supports React Router
deep links, and reads Railway's `$PORT`. Generate a public domain for this
service, then set:

```text
VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

Replace `Backend` with the exact name of the API service. `VITE_API_URL` is
embedded into the frontend at build time, so changes require a rebuild/redeploy.
Set the API's `FRONTEND_BASE_URL` to this service's HTTPS origin.

## 4. Uploaded profile photos

Do not rely on the container filesystem for uploads: it is ephemeral. Railway
Free currently permits one volume of up to 0.5 GB per project. A volume can
preserve local files, but this app currently serves uploaded media only in
`DEBUG` mode, so a volume by itself does not make production profile photos
available. Before accepting real users, configure an object-storage backend
(or implement and secure a production media-serving path) and migrate existing
photos. Keep media files out of the frontend build and source repository.

## 5. Move existing SQLite data (if needed)

The PostgreSQL connection does not copy local SQLite data. If
`back-end/db.sqlite3` contains customer, worker, booking, or payment records,
plan a maintenance window and back up the database and `back-end/media/` first.
With the old SQLite database selected and current application code, export:

```sh
cd back-end
python manage.py dumpdata --natural-foreign --natural-primary \
  --exclude=contenttypes --exclude=auth.permission \
  --output=/tmp/home-service-data.json
```

After Railway has `DATABASE_URL` set to Supabase, run migrations and import the
fixture using the same code and environment:

```sh
python manage.py migrate
python manage.py loaddata /tmp/home-service-data.json
```

Review the imported users, workers, bookings, payments, and admin records before
reopening traffic. Keep the SQLite backup until PostgreSQL data has been
verified and backed up. For a new empty launch, skip export/import and run the
migrations only.

## 6. First release checklist

- Confirm the Railway API's `/health/` returns HTTP 200 and Railway logs show
  the Supabase database connection succeeding.
- Confirm the React service loads and its requests use the deployed API domain.
- Verify customer and worker registration/login, booking, and worker selection
  against staging data.
- Use Stripe test credentials and a test webhook before enabling live payments.
- Configure SMTP and verify booking notifications arrive.
- Finish production media storage before accepting profile-photo uploads.
- Set usage alerts and understand that Railway Free's monthly credit can be
  exhausted. Use an appropriate paid Railway plan before depending on this for
  customer-facing production traffic.
- Configure and test database backups/restoration in Supabase.

## References

- [Railway Django deployment guide](https://docs.railway.com/guides/django)
- [Railway pricing and resource limits](https://docs.railway.com/pricing/plans)
- [Railway frontend build variables](https://docs.railway.com/guides/frontend-environment-variables)
- [Supabase Postgres connection methods](https://supabase.com/docs/guides/database/connecting-to-postgres)
