# ---- Stage 1: Frontend build ----
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY deep-agent/frontend/package*.json ./
RUN npm ci
COPY deep-agent/frontend/ ./
RUN npm run build

# ---- Stage 2: Compile existing TS MCP servers ----
FROM node:20-bookworm-slim AS mcp-build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.json ./
COPY agents ./agents
COPY core ./core
COPY providers ./providers
COPY mcps ./mcps
COPY skills ./skills
COPY commands ./commands
RUN npm ci
RUN npx tsc
RUN npm prune --omit=dev

# ---- Stage 3: Final Python image ----
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY deep-agent/backend/pyproject.toml ./
RUN pip install --no-cache-dir .

# Copy backend code
COPY deep-agent/backend/app ./app

# Copy compiled MCP servers and node_modules
COPY --from=mcp-build /repo/dist ./mcp-dist/dist
COPY --from=mcp-build /repo/node_modules ./mcp-dist/node_modules

# Copy frontend static assets
COPY --from=frontend-build /app/frontend/dist ./static

# Create non-root user
RUN useradd --create-home --shell /usr/sbin/nologin appuser && chown -R appuser:appuser /app
USER appuser

ENV MCP_DIST_DIR=/app/mcp-dist/dist \
    STATIC_DIR=/app/static \
    PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
