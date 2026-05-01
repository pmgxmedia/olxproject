from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import init_db
from app.routers import (
    auth_router,
    listings_router,
    categories_router,
    enquiries_router,
    upload_router,
    users_router,
    admin_router,
)

# Path to the React build output (dist/) at the repository root.
# Directory structure: <repo>/backend/app/main.py → parent × 3 → <repo>/dist/
STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting TradeFlex API...")
    await init_db()
    print("Database initialized!")
    yield
    print("Shutting down TradeFlex API...")


app = FastAPI(
    title="TradeFlex API",
    description="TradeFlex Marketplace Backend API",
    version="1.0.0",
    lifespan=lifespan,
    # Hide docs in production
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(categories_router)
app.include_router(enquiries_router)
app.include_router(upload_router)
app.include_router(users_router)
app.include_router(admin_router)


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Serve the React SPA in production when the build output exists.
# StaticFiles with html=True handles SPA client-side routing (serves index.html
# as fallback for unmatched paths) and sanitizes all paths internally.
# Mounting AFTER include_router ensures API routes always take priority.
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="frontend")
else:
    @app.get("/")
    async def root():
        return {"message": "TradeFlex API", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)