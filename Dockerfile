# ---------------------------------------------------
# 1) Build React (Bun)
# ---------------------------------------------------
FROM oven/bun:latest AS frontend
WORKDIR /app/frontend
COPY front-end/homefront/package.json front-end/homefront/bun.lock ./
RUN bun install
COPY front-end/homefront/ .
RUN bun run build

# ---------------------------------------------------
# 2) Build Django backend
# ---------------------------------------------------
FROM python:3.10-slim AS backend
WORKDIR /app
COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY back-end/ .

# collect static files into /app/staticfiles
RUN python manage.py collectstatic --noinput

# ---------------------------------------------------
# 3) Final Image (only Django + Gunicorn)
# ---------------------------------------------------
FROM python:3.10-slim
WORKDIR /app

COPY --from=backend /app /app
COPY --from=frontend /app/frontend/build /app/static

RUN pip install gunicorn

EXPOSE 8000

CMD ["gunicorn", "HomeService.wsgi:application", "--bind", "0.0.0.0:8000"]
