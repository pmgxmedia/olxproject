from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/")
async def root():
    return {"message": "TradeFlex API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)