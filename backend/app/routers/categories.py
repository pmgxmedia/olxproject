from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Category, CategoryType
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
    
    category_map = {c.id: {"id": c.id, "name": c.name, "slug": c.slug, "icon": c.icon, "category_type": c.category_type, "parent_id": c.parent_id, "children": []} for c in categories}
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
    
    return {"id": category.id, "name": category.name, "slug": category.slug, "icon": category.icon, "category_type": category.category_type, "parent_id": category.parent_id}