from fastapi import FastAPI, HTTPException, Depends, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, field_validator
from sqlalchemy import create_engine, Column, Integer, String, Text, Float
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import inspect
from datetime import datetime, timedelta
from typing import Optional, List
import hashlib
import secrets
import os
from PIL import Image
import io
import base64
import uuid

app = FastAPI(title="TradeFlex API")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, default="user")
    status = Column(String, default="active")
    location_city = Column(String, nullable=True)
    location_state = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(String, default=datetime.now().isoformat)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    icon = Column(String, nullable=True)
    parent_id = Column(Integer, nullable=True)

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    category_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    currency = Column(String, default="ZAR")
    location_city = Column(String, nullable=True)
    location_state = Column(String, nullable=True)
    location_suburb = Column(String, nullable=True)
    condition = Column(String, default="used")
    status = Column(String, default="pending")
    image_urls = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    video_thumbnail_url = Column(String, nullable=True)
    views_count = Column(Integer, default=0)
    created_at = Column(String, default=datetime.now().isoformat)

class Enquiry(Base):
    __tablename__ = "enquiries"
    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, nullable=False)
    sender_id = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, default="unread")
    created_at = Column(String, default=datetime.now().isoformat)

class Promotion(Base):
    __tablename__ = "promotions"
    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, nullable=False)
    promo_type = Column(String, default="featured")
    starts_at = Column(String, nullable=True)
    ends_at = Column(String, nullable=True)
    created_at = Column(String, default=datetime.now().isoformat)

engine = create_engine("sqlite:///tradeflex.db", echo=False)
Session = sessionmaker(bind=engine)

Base.metadata.create_all(engine)

# Add new columns if they don't exist (migration for video fields)
from sqlalchemy import inspect, text
inspector = inspect(engine)
columns = [col['name'] for col in inspector.get_columns('listings')]
if 'video_url' not in columns:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE listings ADD COLUMN video_url TEXT"))
        conn.execute(text("ALTER TABLE listings ADD COLUMN video_thumbnail_url TEXT"))
        conn.commit()

session = Session()
if session.query(Category).count() == 0:
    cats = [
        Category(name="Vehicles", slug="vehicles", icon="car"),
        Category(name="Electronics", slug="electronics", icon="smartphone"),
        Category(name="Property", slug="property", icon="home"),
        Category(name="Furniture & Home", slug="furniture-home", icon="sofa"),
        Category(name="Fashion", slug="fashion", icon="shirt"),
        Category(name="Sports & Leisure", slug="sports-leisure", icon="dumbbell"),
        Category(name="Services", slug="services", icon="wrench"),
        Category(name="Kids", slug="kids", icon="baby"),
        Category(name="Jobs", slug="jobs", icon="briefcase"),
    ]
    session.add_all(cats)
    session.commit()
session.close()

SECRET_KEY = "tradeflex_secret_key_change_in_production"
ALGORITHM = "HS256"

def create_token(user_id: int, email: str, role: str) -> str:
    from base64 import b64encode
    import json
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": (datetime.now() + timedelta(days=7)).timestamp()
    }
    data = b64encode(json.dumps(payload).encode()).decode()
    signature = hashlib.sha256(f"{data}{SECRET_KEY}".encode()).hexdigest()[:32]
    return f"{data}.{signature}"

def verify_token(token: str) -> Optional[dict]:
    try:
        from base64 import b64decode
        import json
        parts = token.split(".")
        if len(parts) != 2:
            return None
        data_part, signature = parts
        expected_sig = hashlib.sha256(f"{data_part}{SECRET_KEY}".encode()).hexdigest()[:32]
        if signature != expected_sig:
            return None
        payload = json.loads(b64decode(data_part).decode())
        if payload.get("exp", 0) < datetime.now().timestamp():
            return None
        return payload
    except:
        return None

def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication")
    token = parts[1]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

class RegisterData(BaseModel):
    email: str
    name: str
    password: str
    phone: Optional[str] = None

class LoginData(BaseModel):
    email: str
    password: str

class UpdateProfileData(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class CreateListingData(BaseModel):
    category_id: int
    title: str
    description: str
    condition: str
    price: int
    location_city: str
    location_state: str
    location_suburb: Optional[str] = None
    image_urls: Optional[str] = None
    video_url: Optional[str] = None
    video_thumbnail_url: Optional[str] = None
    
    @field_validator('image_urls', mode='before')
    @classmethod
    def convert_image_urls(cls, v):
        if isinstance(v, list):
            return ','.join(v)
        return v

class EnquiryData(BaseModel):
    listing_id: int
    message: str

@app.get("/")
def root():
    return {"message": "TradeFlex API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/categories")
def get_categories():
    session = Session()
    try:
        cats = session.query(Category).all()
        return [{"id": c.id, "name": c.name, "slug": c.slug, "icon": c.icon} for c in cats]
    finally:
        session.close()

@app.post("/api/auth/register")
def register(data: RegisterData):
    session = Session()
    try:
        existing = session.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        role = "admin" if data.email.startswith("admin@") else "user"
        
        new_user = User(
            email=data.email,
            name=data.name,
            password_hash=hashlib.sha256(data.password.encode()).hexdigest(),
            role=role,
            status="active",
            phone=data.phone
        )
        session.add(new_user)
        session.commit()
        
        token = create_token(new_user.id, new_user.email, new_user.role)
        refresh = create_token(new_user.id, new_user.email, new_user.role)
        
        return {
            "access_token": token,
            "refresh_token": refresh,
            "token_type": "bearer",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "phone": new_user.phone,
                "role": new_user.role,
                "status": new_user.status,
                "location_city": new_user.location_city,
                "location_state": new_user.location_state,
                "avatar_url": new_user.avatar_url,
                "bio": new_user.bio,
                "created_at": new_user.created_at
            }
        }
    finally:
        session.close()

@app.post("/api/auth/login")
def login(data: LoginData):
    session = Session()
    try:
        pw_hash = hashlib.sha256(data.password.encode()).hexdigest()
        user = session.query(User).filter(
            User.email == data.email,
            User.password_hash == pw_hash
        ).first()
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if user.status == "blocked":
            raise HTTPException(status_code=403, detail="Account is blocked")
        
        token = create_token(user.id, user.email, user.role)
        refresh = create_token(user.id, user.email, user.role)
        
        return {
            "access_token": token,
            "refresh_token": refresh,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "phone": user.phone,
                "role": user.role,
                "status": user.status,
                "location_city": user.location_city,
                "location_state": user.location_state,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "created_at": user.created_at
            }
        }
    finally:
        session.close()

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        user = session.query(User).filter(User.id == current_user["user_id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "status": user.status,
            "location_city": user.location_city,
            "location_state": user.location_state,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "created_at": user.created_at
        }
    finally:
        session.close()

@app.put("/api/auth/profile")
def update_profile(data: UpdateProfileData, current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        user = session.query(User).filter(User.id == current_user["user_id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if data.name is not None:
            user.name = data.name
        if data.phone is not None:
            user.phone = data.phone
        if data.location_city is not None:
            user.location_city = data.location_city
        if data.location_state is not None:
            user.location_state = data.location_state
        if data.avatar_url is not None:
            user.avatar_url = data.avatar_url
        if data.bio is not None:
            user.bio = data.bio
        
        session.commit()
        
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "status": user.status,
            "location_city": user.location_city,
            "location_state": user.location_state,
            "avatar_url": user.avatar_url,
            "bio": user.bio,
            "created_at": user.created_at
        }
    finally:
        session.close()

@app.get("/api/admin/seed")
def seed_admin():
    session = Session()
    try:
        admin = session.query(User).filter(User.email == "admin@tradeflex.com").first()
        if admin:
            return {"message": "Admin already exists"}
        
        admin_user = User(
            email="admin@tradeflex.com",
            name="Admin",
            password_hash=hashlib.sha256("admin123".encode()).hexdigest(),
            role="admin",
            status="active"
        )
        session.add(admin_user)
        session.commit()
        return {"message": "Admin user created", "email": "admin@tradeflex.com", "password": "admin123"}
    finally:
        session.close()

@app.get("/api/listings")
def get_listings(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    location: Optional[str] = None,
    sort_by: Optional[str] = None,
    page: int = 1,
    per_page: int = 12
):
    session = Session()
    try:
        query = session.query(Listing).filter(Listing.status == "active")
        
        # Apply filters
        if category_id:
            query = query.filter(Listing.category_id == category_id)
        if search:
            query = query.filter(Listing.title.contains(search) | Listing.description.contains(search))
        if min_price is not None:
            query = query.filter(Listing.price >= min_price)
        if max_price is not None:
            query = query.filter(Listing.price <= max_price)
        if condition:
            query = query.filter(Listing.condition == condition)
        if location:
            query = query.filter(Listing.location_city.contains(location) | Listing.location_state.contains(location) | Listing.location_suburb.contains(location))
        
        # Sorting
        if sort_by == 'newest':
            query = query.order_by(Listing.created_at.desc())
        elif sort_by == 'price_asc':
            query = query.order_by(Listing.price.asc())
        elif sort_by == 'price_desc':
            query = query.order_by(Listing.price.desc())
        
        # Pagination
        total = query.count()
        last_page = (total + per_page - 1) // per_page
        offset = (page - 1) * per_page
        listings = query.offset(offset).limit(per_page).all()
        
        return {
            "data": [{
                "id": l.id,
                "user_id": l.user_id,
                "category_id": l.category_id,
                "title": l.title,
                "price": l.price,
                "currency": l.currency,
                "location_city": l.location_city,
                "location_state": l.location_state,
                "location_suburb": l.location_suburb,
                "condition": l.condition,
                "status": l.status,
                "views_count": l.views_count,
                "images": [{"image_url": url.strip(), "is_primary": idx == 0} for idx, url in enumerate(l.image_urls.split(","))] if l.image_urls else [],
                "is_favorited": False,
                "created_at": l.created_at
            } for l in listings],
            "current_page": page,
            "last_page": last_page,
            "per_page": per_page,
            "total": total
        }
    finally:
        session.close()

@app.get("/api/listings/my-listings")
def get_my_listings(current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        listings = session.query(Listing).filter(Listing.user_id == current_user["user_id"]).all()
        return [{
            "id": l.id,
            "user_id": l.user_id,
            "category_id": l.category_id,
            "title": l.title,
            "price": l.price,
            "currency": l.currency,
            "location_city": l.location_city,
            "location_state": l.location_state,
            "location_suburb": l.location_suburb,
            "condition": l.condition,
            "status": l.status,
            "views_count": l.views_count,
            "images": [{"image_url": url.strip(), "is_primary": idx == 0} for idx, url in enumerate(l.image_urls.split(","))] if l.image_urls else [],
            "is_favorited": False,
            "created_at": l.created_at
        } for l in listings]
    finally:
        session.close()

@app.get("/api/listings/{listing_id}")
def get_listing(listing_id: int):
    session = Session()
    try:
        listing = session.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        seller = session.query(User).filter(User.id == listing.user_id).first()
        category = session.query(Category).filter(Category.id == listing.category_id).first()
        
        return {
            "id": listing.id,
            "user_id": listing.user_id,
            "category_id": listing.category_id,
            "title": listing.title,
            "description": listing.description,
            "price": listing.price,
            "currency": listing.currency,
            "location_city": listing.location_city,
            "location_state": listing.location_state,
            "location_suburb": listing.location_suburb,
            "condition": listing.condition,
            "status": listing.status,
            "views_count": listing.views_count,
            "images": [{"image_url": url.strip(), "is_primary": idx == 0} for idx, url in enumerate(listing.image_urls.split(","))] if listing.image_urls else [],
            "created_at": listing.created_at,
            "seller": {
                "id": seller.id,
                "name": seller.name,
                "phone": seller.phone,
                "location_city": seller.location_city,
                "avatar_url": seller.avatar_url
            } if seller else None,
            "category": {
                "id": category.id,
                "name": category.name,
                "slug": category.slug
            } if category else None
        }
    finally:
        session.close()

@app.post("/api/listings")
def create_listing(data: dict, current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        # Convert image_urls list to comma-separated string for storage
        image_urls = data.get('image_urls')
        if isinstance(image_urls, list):
            image_urls = ','.join(image_urls)
        
        new_listing = Listing(
            user_id=current_user["user_id"],
            category_id=data['category_id'],
            title=data['title'],
            description=data['description'],
            condition=data['condition'],
            price=data['price'],
            location_city=data['location_city'],
            location_state=data['location_state'],
            location_suburb=data.get('location_suburb'),
            image_urls=image_urls,
            video_url=data.get('video_url'),
            video_thumbnail_url=data.get('video_thumbnail_url'),
            status="pending"
        )
        session.add(new_listing)
        session.commit()
        
        return {
            "id": new_listing.id,
            "user_id": new_listing.user_id,
            "category_id": new_listing.category_id,
            "title": new_listing.title,
            "description": new_listing.description,
            "price": new_listing.price,
            "currency": new_listing.currency,
            "location_city": new_listing.location_city,
            "location_state": new_listing.location_state,
            "location_suburb": new_listing.location_suburb,
            "condition": new_listing.condition,
            "status": new_listing.status,
            "views_count": 0,
            "images": [{"image_url": url.strip(), "is_primary": idx == 0} for idx, url in enumerate(new_listing.image_urls.split(","))] if new_listing.image_urls else [],
            "video_url": new_listing.video_url,
            "video_thumbnail_url": new_listing.video_thumbnail_url,
            "seller": None,
            "category": None,
            "is_favorited": False,
            "created_at": new_listing.created_at,
            "updated_at": new_listing.created_at
        }
    finally:
        session.close()

@app.patch("/api/admin/listings/{listing_id}/approve")
def approve_listing(listing_id: int, admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        listing = session.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        listing.status = "active"
        session.commit()
        return {"message": "Listing approved"}
    finally:
        session.close()

@app.patch("/api/admin/listings/{listing_id}/reject")
def reject_listing(listing_id: int, admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        listing = session.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        listing.status = "rejected"
        session.commit()
        return {"message": "Listing rejected"}
    finally:
        session.close()

@app.delete("/api/listings/{listing_id}")
def delete_listing(listing_id: int, current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        listing = session.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        if listing.user_id != current_user["user_id"] and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        session.delete(listing)
        session.commit()
        return {"message": "Listing deleted"}
    finally:
        session.close()

class UpdateListingData(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    condition: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_suburb: Optional[str] = None
    image_urls: Optional[str] = None
    video_url: Optional[str] = None
    video_thumbnail_url: Optional[str] = None

@app.put("/api/listings/{listing_id}")
def update_listing(listing_id: int, data: UpdateListingData, current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        listing = session.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        if listing.user_id != current_user["user_id"] and current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Update allowed fields
        if data.title is not None:
            listing.title = data.title
        if data.description is not None:
            listing.description = data.description
        if data.price is not None:
            listing.price = data.price
        if data.condition is not None:
            listing.condition = data.condition
        if data.location_city is not None:
            listing.location_city = data.location_city
        if data.location_state is not None:
            listing.location_state = data.location_state
        if data.location_suburb is not None:
            listing.location_suburb = data.location_suburb
        if data.image_urls is not None:
            listing.image_urls = data.image_urls
        if data.video_url is not None:
            listing.video_url = data.video_url
        if data.video_thumbnail_url is not None:
            listing.video_thumbnail_url = data.video_thumbnail_url
        
        session.commit()
        
        return {
            "id": listing.id,
            "user_id": listing.user_id,
            "category_id": listing.category_id,
            "title": listing.title,
            "description": listing.description,
            "price": listing.price,
            "currency": listing.currency,
            "location_city": listing.location_city,
            "location_state": listing.location_state,
            "location_suburb": listing.location_suburb,
            "condition": listing.condition,
            "status": listing.status,
            "views_count": listing.views_count,
            "images": [{"image_url": url.strip(), "is_primary": idx == 0} for idx, url in enumerate(listing.image_urls.split(","))] if listing.image_urls else [],
            "video_url": listing.video_url,
            "video_thumbnail_url": listing.video_thumbnail_url,
            "seller": None,
            "category": None,
            "is_favorited": False,
            "created_at": listing.created_at,
            "updated_at": listing.created_at
        }
    finally:
        session.close()

@app.get("/api/admin/listings")
def get_admin_listings(admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        listings = session.query(Listing).all()
        return [{
            "id": l.id,
            "user_id": l.user_id,
            "category_id": l.category_id,
            "title": l.title,
            "description": l.description,
            "price": l.price,
            "currency": l.currency,
            "location_city": l.location_city,
            "location_state": l.location_state,
            "location_suburb": l.location_suburb,
            "condition": l.condition,
            "status": l.status,
            "views_count": l.views_count,
            "created_at": l.created_at
        } for l in listings]
    finally:
        session.close()

@app.get("/api/admin/users")
def get_admin_users(admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        users = session.query(User).all()
        return [{
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "role": u.role,
            "status": u.status,
            "location_city": u.location_city,
            "location_state": u.location_state,
            "created_at": u.created_at
        } for u in users]
    finally:
        session.close()

@app.patch("/api/admin/users/{user_id}/block")
def block_user(user_id: int, admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.status = "blocked"
        session.commit()
        return {"message": "User blocked"}
    finally:
        session.close()

@app.patch("/api/admin/users/{user_id}/unblock")
def unblock_user(user_id: int, admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        user = session.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.status = "active"
        session.commit()
        return {"message": "User unblocked"}
    finally:
        session.close()

@app.get("/api/admin/analytics")
def get_analytics(admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        total_listings = session.query(Listing).count()
        active_listings = session.query(Listing).filter(Listing.status == "active").count()
        pending_listings = session.query(Listing).filter(Listing.status == "pending").count()
        rejected_listings = session.query(Listing).filter(Listing.status == "rejected").count()
        total_users = session.query(User).count()
        active_users = session.query(User).filter(User.status == "active").count()
        blocked_users = session.query(User).filter(User.status == "blocked").count()
        total_enquiries = session.query(Enquiry).count()
        
        listings_by_category = []
        categories = session.query(Category).all()
        for cat in categories:
            count = session.query(Listing).filter(Listing.category_id == cat.id, Listing.status == "active").count()
            listings_by_category.append({"category": cat.name, "count": count})
        
        return {
            "total_listings": total_listings,
            "active_listings": active_listings,
            "pending_listings": pending_listings,
            "rejected_listings": rejected_listings,
            "total_users": total_users,
            "active_users": active_users,
            "blocked_users": blocked_users,
            "total_enquiries": total_enquiries,
            "listings_by_category": listings_by_category
        }
    finally:
        session.close()

@app.post("/api/enquiries")
def create_enquiry(data: EnquiryData, current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        listing = session.query(Listing).filter(Listing.id == data.listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        enquiry = Enquiry(
            listing_id=data.listing_id,
            sender_id=current_user["user_id"],
            message=data.message,
            status="unread"
        )
        session.add(enquiry)
        session.commit()
        
        return {
            "id": enquiry.id,
            "listing_id": enquiry.listing_id,
            "sender_id": enquiry.sender_id,
            "message": enquiry.message,
            "status": enquiry.status,
            "created_at": enquiry.created_at
        }
    finally:
        session.close()

@app.get("/api/enquiries/my-enquiries")
def get_my_enquiries(current_user: dict = Depends(get_current_user)):
    session = Session()
    try:
        listings = session.query(Listing).filter(Listing.user_id == current_user["user_id"]).all()
        listing_ids = [l.id for l in listings]
        
        enquiries = session.query(Enquiry).filter(Enquiry.listing_id.in_(listing_ids)).all()
        
        result = []
        for e in enquiries:
            listing = session.query(Listing).filter(Listing.id == e.listing_id).first()
            sender = session.query(User).filter(User.id == e.sender_id).first()
            result.append({
                "id": e.id,
                "listing_id": e.listing_id,
                "listing_title": listing.title if listing else None,
                "sender_id": e.sender_id,
                "sender_name": sender.name if sender else None,
                "sender_email": sender.email if sender else None,
                "message": e.message,
                "status": e.status,
                "created_at": e.created_at
            })
        
        return result
    finally:
        session.close()

@app.get("/api/admin/enquiries")
def get_admin_enquiries(admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        enquiries = session.query(Enquiry).all()
        result = []
        for e in enquiries:
            listing = session.query(Listing).filter(Listing.id == e.listing_id).first()
            sender = session.query(User).filter(User.id == e.sender_id).first()
            result.append({
                "id": e.id,
                "listing_id": e.listing_id,
                "listing_title": listing.title if listing else None,
                "sender_id": e.sender_id,
                "sender_name": sender.name if sender else None,
                "sender_email": sender.email if sender else None,
                "message": e.message,
                "status": e.status,
                "created_at": e.created_at
            })
        return result
    finally:
        session.close()

@app.patch("/api/admin/enquiries/{enquiry_id}/read")
def mark_enquiry_read(enquiry_id: int, admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        enquiry = session.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            raise HTTPException(status_code=404, detail="Enquiry not found")
        enquiry.status = "read"
        session.commit()
        return {"message": "Enquiry marked as read"}
    finally:
        session.close()

@app.post("/api/admin/promotions")
def create_promotion(listing_id: int, promo_type: str, admin_user: dict = Depends(require_admin)):
    session = Session()
    try:
        listing = session.query(Listing).filter(Listing.id == listing_id).first()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        promotion = Promotion(
            listing_id=listing_id,
            promo_type=promo_type
        )
        session.add(promotion)
        session.commit()
        
        return {"message": "Promotion created", "promo_type": promo_type}
    finally:
        session.close()

@app.post("/api/upload/image")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    img = Image.open(io.BytesIO(content))
    
    max_size = (1200, 1200)
    img.thumbnail(max_size, Image.Resampling.LANCZOS)
    
    filename = f"{uuid.uuid4()}.{img.format.lower()}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    img.save(filepath, format=img.format)
    
    return {
        "url": f"/uploads/{filename}",
        "filename": filename
    }

@app.post("/api/upload/video")
async def upload_video(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    content = await file.read()
    
    # Get file extension
    file_ext = file.filename.split('.')[-1] if file.filename else 'mp4'
    filename = f"{uuid.uuid4()}.{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Save video file
    with open(filepath, 'wb') as f:
        f.write(content)
    
    return {
        "url": f"/uploads/{filename}",
        "filename": filename,
        "thumbnail": None
    }

if __name__ == "__main__":
    session = Session()
    try:
        admin = session.query(User).filter(User.email == "admin@tradeflex.com").first()
        if not admin:
            admin_user = User(
                email="admin@tradeflex.com",
                name="Admin",
                password_hash=hashlib.sha256("admin123".encode()).hexdigest(),
                role="admin",
                status="active"
            )
            session.add(admin_user)
            session.commit()
            print("Admin user created: admin@tradeflex.com / admin123")
    finally:
        session.close()
    
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)