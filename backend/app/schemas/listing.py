from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ListingImageBase(BaseModel):
    image_url: str
    processed_url: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0


class ListingImageResponse(ListingImageBase):
    id: int
    
    model_config = {"from_attributes": True}


class CreateListingInput(BaseModel):
    category_id: int
    title: str = Field(..., max_length=150)
    description: str = Field(..., min_length=10)
    condition: str = Field(..., pattern="^(new|used|refurbished)$")
    price: int = Field(..., gt=0)
    location_city: str
    location_state: str
    location_suburb: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    image_urls: List[str]
    video_url: Optional[str] = None


class ListingBase(BaseModel):
    title: str
    description: str
    price: int
    currency: str = "ZAR"
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_suburb: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    condition: str = "used"
    status: str = "active"


class ListingCreate(ListingBase):
    category_id: int
    image_urls: List[str] = []
    video_url: Optional[str] = None


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[int] = None
    condition: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_suburb: Optional[str] = None
    status: Optional[str] = None
    video_url: Optional[str] = None
    video_thumbnail_url: Optional[str] = None


class CategorySimple(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    
    model_config = {"from_attributes": True}


class UserSimple(BaseModel):
    id: int
    name: str
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ListingResponse(BaseModel):
    id: int
    user_id: int
    category_id: int
    title: str
    description: str
    price: int
    currency: str
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_suburb: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    condition: str
    status: str
    video_url: Optional[str] = None
    video_thumbnail_url: Optional[str] = None
    views_count: int
    images: List[ListingImageResponse] = []
    seller: Optional[UserSimple] = None
    category: Optional[CategorySimple] = None
    is_favorited: bool = False
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class ListingListResponse(BaseModel):
    id: int
    user_id: int
    category_id: int
    title: str
    price: int
    currency: str
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_suburb: Optional[str] = None
    condition: str
    status: str
    views_count: int
    images: List[ListingImageResponse] = []
    is_favorited: bool = False
    created_at: datetime
    
    model_config = {"from_attributes": True}


class ListingFilters(BaseModel):
    search: Optional[str] = None
    category_id: Optional[int] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    sort_by: Optional[str] = "newest"
    page: int = 1
    per_page: int = 12


class PaginatedListings(BaseModel):
    data: List[ListingListResponse]
    current_page: int
    last_page: int
    per_page: int
    total: int


class FavoriteResponse(BaseModel):
    listing_id: int
    favorited: bool