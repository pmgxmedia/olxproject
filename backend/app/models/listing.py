from sqlalchemy import Column, Integer, String, Enum, Float, DateTime, ForeignKey, func, Text
from app.database import Base
import enum


class ListingCondition(str, enum.Enum):
    NEW = "new"
    USED = "used"
    REFURBISHED = "refurbished"


class ListingStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    SOLD = "sold"
    REJECTED = "rejected"


class Listing(Base):
    __tablename__ = "listings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    currency = Column(String(10), default="ZAR", nullable=False)
    location_city = Column(String(100), nullable=True)
    location_state = Column(String(100), nullable=True)
    location_suburb = Column(String(100), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    condition = Column(Enum(ListingCondition), default=ListingCondition.USED, nullable=False)
    status = Column(Enum(ListingStatus), default=ListingStatus.PENDING, nullable=False)
    video_url = Column(String(500), nullable=True)
    video_thumbnail_url = Column(String(500), nullable=True)
    views_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)