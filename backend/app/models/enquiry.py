from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, func
from app.database import Base
import enum


class EnquiryStatus(str, enum.Enum):
    NEW = "new"
    READ = "read"
    REPLIED = "replied"
    ARCHIVED = "archived"


class Enquiry(Base):
    __tablename__ = "enquiries"
    
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    status = Column(Enum(EnquiryStatus), default=EnquiryStatus.NEW, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)