from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import Category, CategoryType, Listing
from app.schemas import CategoryResponse
from typing import List, Optional


router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    type: Optional[str] = Query(None, description="Filter by category type: items, services, or jobs"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Category)
    
    if type and type in ["items", "services", "jobs"]:
        query = query.where(Category.category_type == type)
    
    result = await db.execute(query)
    categories = result.scalars().all()
    
    listing_counts = {}
    if categories:
        count_query = select(Listing.category_id, func.count(Listing.id).label('count')).where(Listing.status == "active").group_by(Listing.category_id)
        count_result = await db.execute(count_query)
        listing_counts = {row[0]: row[1] for row in count_result.all()}
    
    category_map = {c.id: {"id": c.id, "name": c.name, "slug": c.slug, "icon": c.icon, "category_type": c.category_type, "parent_id": c.parent_id, "children": [], "listing_count": listing_counts.get(c.id, 0)} for c in categories}
    tree = []
    
    for c in categories:
        cat = category_map[c.id]
        if c.parent_id and c.parent_id in category_map:
            category_map[c.parent_id]["children"].append(cat)
        else:
            tree.append(cat)
    
    return tree


@router.get("/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.slug == slug))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    count_result = await db.execute(select(func.count(Listing.id)).where(Listing.category_id == category.id, Listing.status == "active"))
    listing_count = count_result.scalar() or 0
    
    all_cats_result = await db.execute(select(Category))
    all_categories = all_cats_result.scalars().all()
    
    children = []
    for c in all_categories:
        if c.parent_id == category.id:
            child_count_result = await db.execute(select(func.count(Listing.id)).where(Listing.category_id == c.id, Listing.status == "active"))
            child_count = child_count_result.scalar() or 0
            children.append({
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "icon": c.icon,
                "category_type": c.category_type,
                "parent_id": c.parent_id,
                "listing_count": child_count,
                "children": []
            })
    
    return {
        "id": category.id,
        "name": category.name,
        "slug": category.slug,
        "icon": category.icon,
        "category_type": category.category_type,
        "parent_id": category.parent_id,
        "listing_count": listing_count,
        "children": children
    }