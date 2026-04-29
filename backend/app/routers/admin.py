from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import User, Listing, Enquiry, Category, ListingImage
from app.schemas import UserResponse, UserUpdate, ListingResponse, ListingUpdate
from app.dependencies import require_admin
from typing import List, Optional


router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    status_filter: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = select(User)
    
    if status_filter and status_filter != "all":
        query = query.where(User.status == status_filter)
    
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page).order_by(User.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [UserResponse.model_validate(u) for u in users]


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if user.id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own status",
        )
    
    user.status = status
    await db.commit()
    
    return {"message": f"User status updated to {status}"}


@router.get("/listings")
async def get_all_listings(
    status_filter: Optional[str] = None,
    page: int = 1,
    per_page: int = 20,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = select(Listing)
    
    if status_filter and status_filter != "all":
        query = query.where(Listing.status == status_filter)
    
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page).order_by(Listing.created_at.desc())
    query = query.options(selectinload(Listing.images))
    query = query.options(selectinload(Listing.seller))
    query = query.options(selectinload(Listing.category))
    
    result = await db.execute(query)
    listings = result.scalars().all()
    
    data = []
    for listing in listings:
        data.append(ListingResponse(
            id=listing.id,
            user_id=listing.user_id,
            category_id=listing.category_id,
            title=listing.title,
            description=listing.description,
            price=listing.price,
            currency=listing.currency,
            location_city=listing.location_city,
            location_state=listing.location_state,
            location_suburb=listing.location_suburb,
            location_lat=listing.location_lat,
            location_lng=listing.location_lng,
            condition=listing.condition,
            status=listing.status,
            video_url=listing.video_url,
            video_thumbnail_url=listing.video_thumbnail_url,
            views_count=listing.views_count,
            images=[{"id": i.id, "image_url": i.image_url, "processed_url": i.processed_url, "is_primary": i.is_primary, "sort_order": i.sort_order} for i in listing.images],
            seller={"id": listing.seller.id, "name": listing.seller.name, "location_city": listing.seller.location_city, "location_state": listing.seller.location_state, "avatar_url": listing.seller.avatar_url, "created_at": listing.seller.created_at} if listing.seller else None,
            category={"id": listing.category.id, "name": listing.category.name, "slug": listing.category.slug, "icon": listing.category.icon} if listing.category else None,
            is_favorited=False,
            created_at=listing.created_at,
            updated_at=listing.updated_at,
        ))
    
    return data


@router.patch("/listings/{listing_id}/approve")
async def approve_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    listing.status = "active"
    await db.commit()
    
    return {"message": "Listing approved"}


@router.patch("/listings/{listing_id}/reject")
async def reject_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    listing.status = "rejected"
    await db.commit()
    
    return {"message": "Listing rejected"}


@router.get("/enquiries", response_model=List)
async def get_all_enquiries(
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = select(Enquiry)
    
    if status_filter and status_filter != "all":
        query = query.where(Enquiry.status == status_filter)
    
    query = query.order_by(Enquiry.created_at.desc())
    result = await db.execute(query)
    enquiries = result.scalars().all()
    
    data = []
    for eq in enquiries:
        sender_result = await db.execute(select(User).where(User.id == eq.sender_id))
        sender = sender_result.scalar_one_or_none()
        listing_result = await db.execute(select(Listing).where(Listing.id == eq.listing_id))
        listing = listing_result.scalar_one_or_none()
        
        data.append({
            "id": eq.id,
            "listing_id": eq.listing_id,
            "listing_title": listing.title if listing else None,
            "sender_id": eq.sender_id,
            "sender_name": sender.name if sender else None,
            "sender_email": sender.email if sender else None,
            "message": eq.message,
            "status": eq.status.value if eq.status else eq.status,
            "created_at": eq.created_at,
        })
    
    return data


@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_users = await db.scalar(select(func.count()).select_from(User))
    total_listings = await db.scalar(select(func.count()).select_from(Listing))
    active_listings = await db.scalar(
        select(func.count()).select_from(Listing).where(Listing.status == "active")
    )
    pending_listings = await db.scalar(
        select(func.count()).select_from(Listing).where(Listing.status == "pending")
    )
    new_enquiries = await db.scalar(
        select(func.count()).select_from(Enquiry).where(Enquiry.status == "new")
    )
    total_views = await db.scalar(select(func.sum(Listing.views_count)).select_from(Listing))
    
    return {
        "total_users": total_users or 0,
        "total_listings": total_listings or 0,
        "active_listings": active_listings or 0,
        "pending_listings": pending_listings or 0,
        "new_enquiries": new_enquiries or 0,
        "total_views": total_views or 0,
    }