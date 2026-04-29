from sqlalchemy import Column, Integer, ForeignKey, DateTime, func, UniqueConstraint
from app.database import Base


class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="unique_user_listing"),)