#######################################
# 1) Build Frontend (React + Bun)
#######################################
FROM oven/bun:latest AS frontend
WORKDIR /app

# Copy package files
COPY front-end/homefront/package.json ./
COPY front-end/homefront/bun.lock ./

# Install dependencies
RUN bun install

# Copy whole frontend project
COPY front-end/homefront/ .

# Build React (this creates the build folder)
RUN bun run build

# Verify build output exists
RUN ls -la && pwd && find . -name "index.html" -o -name "static"


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

# Create directories
RUN mkdir -p /app/static /app/templates

# Copy entire build folder first, then organize
COPY --from=frontend /app/build /tmp/frontend-build

# Move files to correct locations
RUN if [ -d /tmp/frontend-build/static ]; then \
        cp -r /tmp/frontend-build/static/* /app/static/; \
    else \
        cp -r /tmp/frontend-build/* /app/static/; \
    fi && \
    cp /tmp/frontend-build/index.html /app/templates/index.html


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