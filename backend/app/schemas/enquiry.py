from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EnquiryCreate(BaseModel):
    listing_id: int
    message: str


class EnquiryResponse(BaseModel):
    id: int
    listing_id: int
    listing_title: Optional[str] = None
    sender_id: int
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None
    message: str
    status: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class EnquiryUpdate(BaseModel):
    status: Optional[str] = None


class MessageCreate(BaseModel):
    message: str