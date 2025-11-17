# =========================================
# 1) Build React Frontend
# =========================================
FROM oven/bun:latest AS frontend
WORKDIR /app/frontend

COPY front-end/homefront/package.json front-end/homefront/bun.lock ./
RUN bun install

COPY front-end/homefront/ .
RUN bun run build


# =========================================
# 2) Backend Build Stage
# =========================================
FROM python:3.10-slim AS backend
WORKDIR /app

# Install backend dependencies
COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend project
COPY back-end/ .

# Collect static files
RUN python manage.py collectstatic --noinput


# =========================================
# 3) Final Production Image
# =========================================
FROM python:3.10-slim
WORKDIR /app

# Install runtime Python deps
COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code + staticfiles from backend image
COPY --from=backend /app /app

# Copy built frontend into Django static folder
COPY --from=frontend /app/frontend/build /app/static

EXPOSE 8000

CMD ["gunicorn", "HomeService.wsgi:application", "--bind", "0.0.0.0:8000"]
