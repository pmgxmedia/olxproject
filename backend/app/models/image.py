from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float
from app.database import Base


class ListingImage(Base):
    __tablename__ = "listing_images"
    
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    processed_url = Column(String(500), nullable=True)
    is_primary = Column(Boolean, default=False, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)