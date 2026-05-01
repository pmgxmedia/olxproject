from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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


# ---------------------------------------------------------------------------
# Serve the React SPA in production (when the Vite build output exists).
# The dist folder is one level above the backend package (see Dockerfile).
# ---------------------------------------------------------------------------
_static_dir = Path(__file__).resolve().parent.parent.parent / "dist"

if _static_dir.is_dir():
    # Mount the compiled JS/CSS assets bundle produced by Vite.
    app.mount("/assets", StaticFiles(directory=str(_static_dir / "assets")), name="assets")

    # Pre-build a whitelist of every file that lives at the root of dist/
    # (e.g. favicon.svg, robots.txt).  Using a trusted lookup dict avoids
    # passing user-supplied path fragments directly to FileResponse, which
    # would be a path-injection risk.
    _root_static_files: dict[str, str] = {
        f.name: str(f)
        for f in _static_dir.iterdir()
        if f.is_file()
    }
    _index_html = str(_static_dir / "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        """Serve the React SPA.

        Known root-level static files (favicon, etc.) are returned directly.
        Every other path falls back to index.html so React Router can handle it.
        """
        trusted_path = _root_static_files.get(full_path)
        if trusted_path is not None:
            return FileResponse(trusted_path)
        return FileResponse(_index_html)

else:
    @app.get("/")
    async def root():
        return {"message": "TradeFlex API", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
