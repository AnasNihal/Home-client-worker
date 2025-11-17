# ---------------------------------------------------
# 1) Build React (Bun)
# ---------------------------------------------------
FROM oven/bun:latest AS frontend

WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install

COPY frontend/ .
RUN bun run build


# ---------------------------------------------------
# 2) Build Django backend
# ---------------------------------------------------
FROM python:3.10-slim AS backend

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput


# ---------------------------------------------------
# 3) Production image with Nginx + Django/Gunicorn
# ---------------------------------------------------
FROM python:3.10-slim

WORKDIR /app

COPY --from=backend /app/backend /app
COPY --from=frontend /app/frontend/dist /app/static

COPY nginx.conf /etc/nginx/nginx.conf

RUN pip install gunicorn

EXPOSE 80

CMD service nginx start && gunicorn HomeService.wsgi:application --bind 0.0.0.0:8000
