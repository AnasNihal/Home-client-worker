#######################################
# 1) Build Frontend (React with Bun)
#######################################
FROM oven/bun:latest AS frontend
WORKDIR /app/frontend

COPY front-end/homefront/package.json front-end/homefront/bun.lock ./
RUN bun install

COPY front-end/homefront/ .
RUN bun run build


#######################################
# 2) Backend Build Stage
#######################################
FROM python:3.10-slim AS backend
WORKDIR /app

# Install dependencies
COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY back-end/ .

# Copy frontend build into Django static folder
COPY --from=frontend /app/frontend/build/static /app/static
COPY --from=frontend /app/frontend/build/index.html /app/templates/index.html


#######################################
# 3) Final Image
#######################################
FROM python:3.10-slim
WORKDIR /app

COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire backend app (including static, templates, HomeService, HomeApp)
COPY --from=backend /app /app

# Copy entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Use entrypoint for migrations + collectstatic + gunicorn
CMD ["/app/entrypoint.sh"]
