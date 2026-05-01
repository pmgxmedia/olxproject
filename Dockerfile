# ── Stage 1: Build the React/Vite frontend ───────────────────────────────────
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


# ── Stage 2: Python backend + serve the built frontend ────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source
COPY backend/ ./backend/

# Copy the compiled frontend from stage 1
COPY --from=frontend-build /app/dist ./dist

# Expose the port used by uvicorn (Sevalla reads the PORT env var)
EXPOSE 8000

# Set the working directory to backend so uvicorn resolves the app module correctly.
WORKDIR /app/backend

# Run the FastAPI app.  Use the PORT env variable if Sevalla sets it.
# `exec` replaces the shell process so signals are forwarded correctly.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
