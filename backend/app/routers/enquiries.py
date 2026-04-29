from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, Listing, Enquiry
from app.schemas import EnquiryCreate, EnquiryResponse, EnquiryUpdate
from app.dependencies import get_current_active_user
from typing import List


router = APIRouter(prefix="/api/enquiries", tags=["enquiries"])


@router.get("", response_model=List[EnquiryResponse])
async def get_my_enquiries(
    status_filter: str = "all",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(Enquiry).where(Enquiry.sender_id == current_user.id)
    
    if status_filter and status_filter != "all":
        query = query.where(Enquiry.status == status_filter)
    
    query = query.order_by(Enquiry.created_at.desc())
    result = await db.execute(query)
    enquiries = result.scalars().all()
    
    data = []
    for eq in enquiries:
        listing_result = await db.execute(select(Listing).where(Listing.id == eq.listing_id))
        listing = listing_result.scalar_one_or_none()
        
        data.append(EnquiryResponse(
            id=eq.id,
            listing_id=eq.listing_id,
            listing_title=listing.title if listing else None,
            sender_id=eq.sender_id,
            sender_name=current_user.name,
            sender_email=current_user.email,
            message=eq.message,
            status=eq.status,
            created_at=eq.created_at,
        ))
    
    return data


@router.get("/received", response_model=List[EnquiryResponse])
async def get_received_enquiries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = (
        select(Enquiry)
        .join(Listing, Listing.id == Enquiry.listing_id)
        .where(Listing.user_id == current_user.id)
    )
    query = query.order_by(Enquiry.created_at.desc())
    result = await db.execute(query)
    enquiries = result.scalars().all()
    
    data = []
    for eq in enquiries:
        sender_result = await db.execute(select(User).where(User.id == eq.sender_id))
        sender = sender_result.scalar_one_or_none()
        listing_result = await db.execute(select(Listing).where(Listing.id == eq.listing_id))
        listing = listing_result.scalar_one_or_none()
        
        data.append(EnquiryResponse(
            id=eq.id,
            listing_id=eq.listing_id,
            listing_title=listing.title if listing else None,
            sender_id=eq.sender_id,
            sender_name=sender.name if sender else None,
            sender_email=sender.email if sender else None,
            message=eq.message,
            status=eq.status,
            created_at=eq.created_at,
        ))
    
    return data


@router.post("", response_model=EnquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_enquiry(
    enquiry_data: EnquiryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    listing_result = await db.execute(select(Listing).where(Listing.id == enquiry_data.listing_id))
    listing = listing_result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    new_enquiry = Enquiry(
        listing_id=enquiry_data.listing_id,
        sender_id=current_user.id,
        message=enquiry_data.message,
    )
    
    db.add(new_enquiry)
    await db.commit()
    await db.refresh(new_enquiry)
    
    return EnquiryResponse(
        id=new_enquiry.id,
        listing_id=new_enquiry.listing_id,
        listing_title=listing.title,
        sender_id=new_enquiry.sender_id,
        sender_name=current_user.name,
        sender_email=current_user.email,
        message=new_enquiry.message,
        status=new_enquiry.status,
        created_at=new_enquiry.created_at,
    )


@router.patch("/{enquiry_id}/read", response_model=EnquiryResponse)
async def mark_as_read(
    enquiry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))
    enquiry = result.scalar_one_or_none()
    
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enquiry not found",
        )
    
    enquiry.status = "read"
    await db.commit()
    await db.refresh(enquiry)
    
    return EnquiryResponse(
        id=enquiry.id,
        listing_id=enquiry.listing_id,
        sender_id=enquiry.sender_id,
        message=enquiry.message,
        status=enquiry.status,
        created_at=enquiry.created_at,
    )


@router.patch("/{enquiry_id}/reply", response_model=EnquiryResponse)
async def mark_replied(
    enquiry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))
    enquiry = result.scalar_one_or_none()
    
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enquiry not found",
        )
    
    enquiry.status = "replied"
    await db.commit()
    await db.refresh(enquiry)
    
    return EnquiryResponse(
        id=enquiry.id,
        listing_id=enquiry.listing_id,
        sender_id=enquiry.sender_id,
        message=enquiry.message,
        status=enquiry.status,
        created_at=enquiry.created_at,
    )


@router.delete("/{enquiry_id}")
async def delete_enquiry(
    enquiry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Enquiry).where(Enquiry.id == enquiry_id))
    enquiry = result.scalar_one_or_none()
    
    if not enquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enquiry not found",
        )
    
    if enquiry.sender_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this enquiry",
        )
    
    await db.delete(enquiry)
    await db.commit()
    
    return {"message": "Enquiry deleted"}