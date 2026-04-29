from sqlalchemy import Column, Integer, String, ForeignKey, func, Enum
from app.database import Base
import enum


class CategoryType(str, enum.Enum):
    ITEMS = "items"
    SERVICES = "services"
    JOBS = "jobs"


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    icon = Column(String(50), nullable=True)
    category_type = Column(Enum(CategoryType), default=CategoryType.ITEMS, nullable=False)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(Integer, server_default=func.now(), nullable=False)