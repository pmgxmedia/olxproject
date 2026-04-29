from app.routers.auth import router as auth_router
from app.routers.listings import router as listings_router
from app.routers.categories import router as categories_router
from app.routers.enquiries import router as enquiries_router
from app.routers.upload import router as upload_router
from app.routers.users import router as users_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "listings_router",
    "categories_router",
    "enquiries_router",
    "upload_router",
    "users_router",
    "admin_router",
]