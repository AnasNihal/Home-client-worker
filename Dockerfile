#######################################
# 1) Build Frontend (React + Bun)
#######################################
FROM oven/bun:latest AS frontend
WORKDIR /app/frontend

# Copy package files
COPY front-end/homefront/package.json ./
COPY front-end/homefront/bun.lock ./

# Install dependencies
RUN bun install

# Copy whole frontend project
COPY front-end/homefront/ .

# Build React
RUN bun run build


#######################################
# 2) Backend Build Stage
#######################################
FROM python:3.10-slim AS backend
WORKDIR /app

# Install backend dependencies
COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend project
COPY back-end/ .

# Copy frontend build output (static + index)
COPY --from=frontend /app/frontend/build/static /app/static/
COPY --from=frontend /app/frontend/build/index.html /app/templates/index.html


#######################################
# 3) Final Production Image
#######################################
FROM python:3.10-slim
WORKDIR /app

COPY back-end/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy complete backend code generated in previous stage
COPY --from=backend /app /app

# Add entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

# Start the app using entrypoint
CMD ["/app/entrypoint.sh"]
