from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import enum


class CategoryType(str, enum.Enum):
    ITEMS = "items"
    SERVICES = "services"
    JOBS = "jobs"


class CategoryBase(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = None
    category_type: CategoryType = CategoryType.ITEMS
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    children: Optional[List["CategoryResponse"]] = None
    
    model_config = {"from_attributes": True}


class CategorySimple(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    category_type: CategoryType = CategoryType.ITEMS
    parent_id: Optional[int] = None
    
    model_config = {"from_attributes": True}