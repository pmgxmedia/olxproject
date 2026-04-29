from sqlalchemy import create_engine, Column, Integer, String, Enum
from sqlalchemy.orm import sessionmaker, declarative_base
import enum

class UserRole(enum.Enum):
    user = "user"
    admin = "admin"

class UserStatus(enum.Enum):
    active = "active"
    blocked = "blocked"

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    location_city = Column(String(100), nullable=True)
    location_state = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.active, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    icon = Column(String(50), nullable=True)
    parent_id = Column(Integer, nullable=True)

from datetime import datetime
from sqlalchemy.sql import func

engine = create_engine("sqlite:///tradeflex.db", echo=False)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
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
    finally:
        session.close()