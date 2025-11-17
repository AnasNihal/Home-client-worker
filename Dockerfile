#######################################
# 1) Build Frontend (React + Bun)
#######################################
FROM node:18-alpine AS frontend
WORKDIR /app

# Copy package files
COPY front-end/homefront/package.json ./
COPY front-end/homefront/package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy whole frontend project
COPY front-end/homefront/ .

# Build React
RUN npm run build

# List what was actually created
RUN echo "=== Contents of /app ===" && ls -la /app && \
    echo "=== Looking for build directories ===" && \
    find /app -type d -name "build" -o -name "dist" && \
    echo "=== Looking for index.html ===" && \
    find /app -name "index.html"


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

# Copy the entire build output first
COPY --from=frontend /app/build /tmp/react-build || \
     COPY --from=frontend /app/dist /tmp/react-build || \
     echo "Build directory not found"

# List what we got
RUN ls -la /tmp/react-build/ || echo "No build files copied"

# Copy files more carefully
RUN if [ -f /tmp/react-build/index.html ]; then \
        cp /tmp/react-build/index.html /app/templates/index.html && \
        if [ -d /tmp/react-build/static ]; then \
            cp -r /tmp/react-build/static/* /app/static/; \
        fi; \
    else \
        echo "ERROR: index.html not found in build output"; \
        exit 1; \
    fi


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