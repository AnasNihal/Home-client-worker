# Production deployment

This repo has a Django API in `back-end/` and a React single-page app in
`front-end/homefront/`. Local development uses SQLite; production settings now
require PostgreSQL and reject a missing or non-PostgreSQL `DATABASE_URL`.

## Recommended setup

For the simplest production setup, run the Django API and managed PostgreSQL in
the same Render region, and deploy the React app as a Vercel static site. Vercel
builds this frontend with Vite and its rewrite sends client-side routes back to
`index.html`. Use paid Render services and a paid PostgreSQL database for real
customer data. Render's free web services sleep and its free Postgres expires
after 30 days; neither is suitable for production.

Worker and customer profile photos are stored as Django media files. For a small
single-instance launch, attach a persistent Render disk mounted at `/var/data`
and set `MEDIA_ROOT=/var/data/media`. The disk is required because service
filesystems are otherwise ephemeral. For multiple API instances or higher
availability, move uploaded media to an S3-compatible object store before
scaling; a service-local disk is not shared storage and disables zero-downtime
deploys on Render.

## Deploy the API on Render

Create a paid Render PostgreSQL database and a Python web service from this
repository. Configure the web service root directory as `back-end` and use:

| Setting | Value |
|---|---|
| Build command | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| Pre-deploy command | `python manage.py migrate` |
| Start command | `gunicorn HomeService.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 60 --access-logfile - --error-logfile -` |
| Health check path | `/health/` |

Connect the service to its database and copy the database's **internal** URL to
`DATABASE_URL`. Set these environment variables in Render's service settings;
never commit production values:

```text
DEBUG=False
SECRET_KEY=<at least 50 random characters>
ALLOWED_HOSTS=<api custom domain>,<service>.onrender.com
FRONTEND_BASE_URL=https://<frontend domain>
DATABASE_URL=<Render internal PostgreSQL URL>
MEDIA_ROOT=/var/data/media
STRIPE_SECRET_KEY=<Stripe live secret key>
STRIPE_WEBHOOK_SECRET=<live webhook signing secret>
EMAIL_HOST=<your SMTP provider host>
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=<SMTP username>
EMAIL_HOST_PASSWORD=<SMTP password>
DEFAULT_FROM_EMAIL=<verified sender address>
```

Add a persistent disk mounted at `/var/data` if using local media storage. Add
verified SMTP credentials because the booking workflow sends status notifications.
Add `OPENAI_API_KEY` only if the AI integration is enabled. Configure Stripe's
production webhook to call
`https://<api domain>/payments/stripe/webhook/`. Use test keys and the Stripe
test webhook while validating a staging environment.

The API only permits the single origin in `FRONTEND_BASE_URL` in production.
Use separate staging and production services, databases, secrets, and domains
so their origins and payment modes cannot be mixed.

Create the first administrator from the Render shell after the initial schema
migrations:

```sh
python manage.py createsuperuser
```

## Deploy the frontend on Vercel

Import the repository and set the project root to `front-end/homefront`.
Vercel should use `npm run build` and output directory `dist`. Set this build
environment variable:

```text
VITE_API_URL=https://<api domain>
```

The Vite build embeds this public API URL in the static app. Do not put Stripe,
database, Django, or OpenAI secrets in any `VITE_*` variable. The committed
`vercel.json` provides the history fallback needed by React Router on direct
links and page refreshes.

## Move existing SQLite data to PostgreSQL

The code change does not copy data automatically. If `back-end/db.sqlite3`
contains real users, workers, bookings, reviews, or services, schedule a short
maintenance window and migrate it explicitly:

1. Stop writes to the old app and make a separate backup of `db.sqlite3` and
   the `back-end/media/` directory.
2. With the old SQLite database selected and the current application code,
   export application data:

   ```sh
   cd back-end
   python manage.py dumpdata --natural-foreign --natural-primary \
     --exclude=contenttypes --exclude=auth.permission \
     --output=/tmp/home-service-data.json
   ```

3. Configure the production environment with the PostgreSQL `DATABASE_URL`,
   then run the schema migrations and load the fixture using that same code and
   environment:

   ```sh
   python manage.py migrate
   python manage.py loaddata /tmp/home-service-data.json
   ```

4. Copy the contents of the old media directory into the configured persistent
   media directory, preserving the `user_image/` and `worker_image/` paths.
5. Verify customer and worker login, profile images, listings, booking history,
   and admin records on the new service before reopening traffic. Keep the
   SQLite backup until the PostgreSQL data has been checked and backed up.

Run these commands from an environment that has the production secrets and
database URL set securely. Do not put a production database URL in shell
history, source control, or logs. For a new empty launch, skip the data export
and `loaddata`; `migrate` is still required before serving traffic.

## Release checks

Before enabling customer traffic, verify the deployed `/health/` returns HTTP
200, run backend and frontend CI, confirm the correct production API URL and
allowed host, exercise customer and worker registration/login and booking,
complete Stripe test-mode checkout in staging, then configure live Stripe
keys/webhook. Configure a recurring PostgreSQL backup and test restoration
before relying on the database for customer data.
