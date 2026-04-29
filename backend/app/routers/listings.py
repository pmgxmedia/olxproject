from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.database import get_db
from app.models import User, Listing, ListingImage, Category, Favorite
from app.schemas import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    ListingListResponse,
    PaginatedListings,
    FavoriteResponse,
    ListingFilters,
)
from app.dependencies import get_current_user, get_current_active_user


router = APIRouter(prefix="/api/listings", tags=["listings"])


def apply_filters(query, filters: ListingFilters):
    if filters.search:
        search = f"%{filters.search}%"
        query = query.where(
            or_(
                Listing.title.ilike(search),
                Listing.description.ilike(search),
            )
        )
    
    if filters.category_id:
        query = query.where(Listing.category_id == filters.category_id)
    
    if filters.min_price is not None:
        query = query.where(Listing.price >= filters.min_price)
    
    if filters.max_price is not None:
        query = query.where(Listing.price <= filters.max_price)
    
    if filters.condition:
        query = query.where(Listing.condition == filters.condition)
    
    if filters.location:
        loc = f"%{filters.location}%"
        query = query.where(
            or_(
                Listing.location_city.ilike(loc),
                Listing.location_state.ilike(loc),
            )
        )
    
    return query


def apply_sort(query, sort_by: str):
    if sort_by == "price_asc":
        return query.order_by(Listing.price.asc())
    elif sort_by == "price_desc":
        return query.order_by(Listing.price.desc())
    else:
        return query.order_by(Listing.created_at.desc())


@router.get("", response_model=PaginatedListings)
async def get_listings(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    condition: Optional[str] = None,
    location: Optional[str] = None,
    sort_by: str = "newest",
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    query = select(Listing).where(Listing.status == "active")
    query = apply_filters(query, ListingFilters(
        search=search,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        condition=condition,
        location=location,
        sort_by=sort_by,
    ))
    query = apply_sort(query, sort_by)
    
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    query = query.options(selectinload(Listing.images))
    
    result = await db.execute(query)
    listings = result.scalars().all()
    
    data = []
    for listing in listings:
        img_result = await db.execute(
            select(ListingImage).where(ListingImage.listing_id == listing.id).order_by(ListingImage.sort_order)
        )
        images = img_result.scalars().all()
        data.append(ListingListResponse(
            id=listing.id,
            user_id=listing.user_id,
            category_id=listing.category_id,
            title=listing.title,
            price=listing.price,
            currency=listing.currency,
            location_city=listing.location_city,
            location_state=listing.location_state,
            location_suburb=listing.location_suburb,
            condition=listing.condition,
            status=listing.status,
            views_count=listing.views_count,
            images=[{"id": i.id, "image_url": i.image_url, "processed_url": i.processed_url, "is_primary": i.is_primary, "sort_order": i.sort_order} for i in images],
            is_favorited=False,
            created_at=listing.created_at,
        ))
    
    last_page = (total + per_page - 1) // per_page if total else 1
    
    return PaginatedListings(
        data=data,
        current_page=page,
        last_page=last_page,
        per_page=per_page,
        total=total or 0,
    )


@router.get("/my-listings", response_model=List[ListingListResponse])
async def get_my_listings(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(Listing).where(Listing.user_id == current_user.id)
    
    if status and status != "all":
        query = query.where(Listing.status == status)
    
    query = query.order_by(Listing.created_at.desc())
    query = query.options(selectinload(Listing.images))
    
    result = await db.execute(query)
    listings = result.scalars().all()
    
    data = []
    for listing in listings:
        img_result = await db.execute(
            select(ListingImage).where(ListingImage.listing_id == listing.id).order_by(ListingImage.sort_order)
        )
        images = img_result.scalars().all()
        data.append(ListingListResponse(
            id=listing.id,
            user_id=listing.user_id,
            category_id=listing.category_id,
            title=listing.title,
            price=listing.price,
            currency=listing.currency,
            location_city=listing.location_city,
            location_state=listing.location_state,
            location_suburb=listing.location_suburb,
            condition=listing.condition,
            status=listing.status,
            views_count=listing.views_count,
            images=[{"id": i.id, "image_url": i.image_url, "processed_url": i.processed_url, "is_primary": i.is_primary, "sort_order": i.sort_order} for i in images],
            is_favorited=False,
            created_at=listing.created_at,
        ))
    
    return data


@router.get("/favorites", response_model=List[ListingListResponse])
async def get_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = (
        select(Listing)
        .join(Favorite, Favorite.listing_id == Listing.id)
        .where(Favorite.user_id == current_user.id)
        .where(Listing.status == "active")
    )
    query = query.options(selectinload(Listing.images))
    query = query.order_by(Favorite.created_at.desc())
    
    result = await db.execute(query)
    listings = result.scalars().all()
    
    data = []
    for listing in listings:
        img_result = await db.execute(
            select(ListingImage).where(ListingImage.listing_id == listing.id).order_by(ListingImage.sort_order)
        )
        images = img_result.scalars().all()
        data.append(ListingListResponse(
            id=listing.id,
            user_id=listing.user_id,
            category_id=listing.category_id,
            title=listing.title,
            price=listing.price,
            currency=listing.currency,
            location_city=listing.location_city,
            location_state=listing.location_state,
            location_suburb=listing.location_suburb,
            condition=listing.condition,
            status=listing.status,
            views_count=listing.views_count,
            images=[{"id": i.id, "image_url": i.image_url, "processed_url": i.processed_url, "is_primary": i.is_primary, "sort_order": i.sort_order} for i in images],
            is_favorited=True,
            created_at=listing.created_at,
        ))
    
    return data


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: int = 0,
):
    query = select(Listing).where(Listing.id == listing_id)
    query = query.options(selectinload(Listing.images))
    query = query.options(selectinload(Listing.seller))
    query = query.options(selectinload(Listing.category))
    
    result = await db.execute(query)
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    is_favorited = False
    if current_user:
        fav_result = await db.execute(
            select(Favorite).where(
                Favorite.user_id == current_user.id,
                Favorite.listing_id == listing_id,
            )
        )
        is_favorited = fav_result.scalar_one_or_none() is not None
    
    cat_result = await db.execute(select(Category).where(Category.id == listing.category_id))
    category = cat_result.scalar_one_or_none()
    
    seller_result = await db.execute(select(User).where(User.id == listing.user_id))
    seller = seller_result.scalar_one_or_none()
    
    img_result = await db.execute(
        select(ListingImage).where(ListingImage.listing_id == listing_id).order_by(ListingImage.sort_order)
    )
    images = img_result.scalars().all()
    
    return ListingResponse(
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
        images=[{"id": i.id, "image_url": i.image_url, "processed_url": i.processed_url, "is_primary": i.is_primary, "sort_order": i.sort_order} for i in images],
        seller={"id": seller.id, "name": seller.name, "location_city": seller.location_city, "location_state": seller.location_state, "avatar_url": seller.avatar_url, "created_at": seller.created_at} if seller else None,
        category={"id": category.id, "name": category.name, "slug": category.slug, "icon": category.icon} if category else None,
        is_favorited=is_favorited,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
    )


@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    listing_data: ListingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Category).where(Category.id == listing_data.category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category",
        )
    
    new_listing = Listing(
        user_id=current_user.id,
        category_id=listing_data.category_id,
        title=listing_data.title,
        description=listing_data.description,
        price=listing_data.price,
        currency=listing_data.currency,
        location_city=listing_data.location_city,
        location_state=listing_data.location_state,
        location_suburb=listing_data.location_suburb,
        location_lat=listing_data.location_lat,
        location_lng=listing_data.location_lng,
        condition=listing_data.condition,
        status="pending",
        video_url=listing_data.video_url,
    )
    
    db.add(new_listing)
    await db.flush()
    
    for i, url in enumerate(listing_data.image_urls):
        image = ListingImage(
            listing_id=new_listing.id,
            image_url=url,
            is_primary=i == 0,
            sort_order=i,
        )
        db.add(image)
    
    await db.commit()
    await db.refresh(new_listing)
    
    img_result = await db.execute(
        select(ListingImage).where(ListingImage.listing_id == new_listing.id).order_by(ListingImage.sort_order)
    )
    images = img_result.scalars().all()
    
    return ListingResponse(
        id=new_listing.id,
        user_id=new_listing.user_id,
        category_id=new_listing.category_id,
        title=new_listing.title,
        description=new_listing.description,
        price=new_listing.price,
        currency=new_listing.currency,
        location_city=new_listing.location_city,
        location_state=new_listing.location_state,
        location_suburb=new_listing.location_suburb,
        location_lat=new_listing.location_lat,
        location_lng=new_listing.location_lng,
        condition=new_listing.condition,
        status=new_listing.status,
        video_url=new_listing.video_url,
        video_thumbnail_url=new_listing.video_thumbnail_url,
        views_count=new_listing.views_count,
        images=[{"id": i.id, "image_url": i.image_url, "processed_url": i.processed_url, "is_primary": i.is_primary, "sort_order": i.sort_order} for i in images],
        seller={"id": current_user.id, "name": current_user.name, "location_city": current_user.location_city, "location_state": current_user.location_state, "avatar_url": current_user.avatar_url, "created_at": current_user.created_at},
        category={"id": category.id, "name": category.name, "slug": category.slug, "icon": category.icon},
        is_favorited=False,
        created_at=new_listing.created_at,
        updated_at=new_listing.updated_at,
    )


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: int,
    listing_data: ListingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing",
        )
    
    update_data = listing_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)
    
    await db.commit()
    await db.refresh(listing)
    
    img_result = await db.execute(
        select(ListingImage).where(ListingImage.listing_id == listing_id).order_by(ListingImage.sort_order)
    )
    images = img_result.scalars().all()
    
    cat_result = await db.execute(select(Category).where(Category.id == listing.category_id))
    category = cat_result.scalar_one_or_none()
    
    seller_result = await db.execute(select(User).where(User.id == listing.user_id))
    seller = seller_result.scalar_one_or_none()
    
    return ListingResponse(
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
        images=[{"id": i.id, "image_url": i.image_url, "processed_url": i.processed_url, "is_primary": i.is_primary, "sort_order": i.sort_order} for i in images],
        seller={"id": seller.id, "name": seller.name, "location_city": seller.location_city, "location_state": seller.location_state, "avatar_url": seller.avatar_url, "created_at": seller.created_at} if seller else None,
        category={"id": category.id, "name": category.name, "slug": category.slug, "icon": category.icon} if category else None,
        is_favorited=False,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
    )


@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    if listing.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing",
        )
    
    await db.delete(listing)
    await db.commit()
    
    return {"message": "Listing deleted"}


@router.post("/{listing_id}/favorite", response_model=FavoriteResponse)
async def toggle_favorite(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    fav_result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.listing_id == listing_id,
        )
    )
    favorite = fav_result.scalar_one_or_none()
    
    if favorite:
        await db.delete(favorite)
        await db.commit()
        return FavoriteResponse(listing_id=listing_id, favorited=False)
    else:
        new_favorite = Favorite(
            user_id=current_user.id,
            listing_id=listing_id,
        )
        db.add(new_favorite)
        await db.commit()
        return FavoriteResponse(listing_id=listing_id, favorited=True)


@router.post("/{listing_id}/view")
async def increment_views(
    listing_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    
    listing.views_count += 1
    await db.commit()
    
    return {"views_count": listing.views_count}