from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import Base, engine, SessionLocal, init_db
import models

app = FastAPI(title="TradeFlex Simple API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class Token(BaseModel):
    access_token: str
    user: dict

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "TradeFlex API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/categories")
def get_categories():
    from database import SessionLocal
    session = SessionLocal()
    try:
        cats = session.query(models.Category).all()
        return [{"id": c.id, "name": c.name, "slug": c.slug, "icon": c.icon} for c in cats]
    finally:
        session.close()

@app.post("/api/auth/register", response_model=Token)
def register(user: UserCreate):
    from database import SessionLocal
    import hashlib
    session = SessionLocal()
    try:
        existing = session.query(models.User).filter(models.User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        password_hash = hashlib.sha256(user.password.encode()).hexdigest()
        new_user = models.User(
            email=user.email,
            name=user.name,
            password_hash=password_hash,
            role="user",
            status="active"
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        return Token(
            access_token=f"token_{new_user.id}",
            user={
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name,
                "role": new_user.role,
                "status": new_user.status
            }
        )
    finally:
        session.close()

@app.post("/api/auth/login", response_model=Token)
def login(user: UserCreate):
    from database import SessionLocal
    import hashlib
    session = SessionLocal()
    try:
        password_hash = hashlib.sha256(user.password.encode()).hexdigest()
        existing = session.query(models.User).filter(
            models.User.email == user.email,
            models.User.password_hash == password_hash
        ).first()
        
        if not existing:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return Token(
            access_token=f"token_{existing.id}",
            user={
                "id": existing.id,
                "email": existing.email,
                "name": existing.name,
                "role": existing.role,
                "status": existing.status
            }
        )
    finally:
        session.close()

@app.get("/api/listings")
def get_listings():
    return {"data": [], "current_page": 1, "last_page": 1, "per_page": 12, "total": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)