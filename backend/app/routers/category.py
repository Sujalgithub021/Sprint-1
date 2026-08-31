from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal

from app.schemas.category import (
    CategoryCreate,
    CategoryResponse
)

from app.services.category_service import (
    get_all_categories,
    get_category_by_id,
    create_category
)


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# GET ALL CATEGORIES
# ==================================================

@router.get(
    "/",
    response_model=list[CategoryResponse]
)
def get_categories(
    db: Session = Depends(get_db)
):

    return get_all_categories(db)


# ==================================================
# GET ONE CATEGORY
# ==================================================

@router.get(
    "/{category_id}",
    response_model=CategoryResponse
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db)
):

    category = get_category_by_id(
        db,
        category_id
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return category


# ==================================================
# CREATE CATEGORY
# ==================================================

@router.post(
    "/",
    response_model=CategoryResponse
)
def add_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db)
):

    category_name = category_data.name.strip()

    if not category_name:
        raise HTTPException(
            status_code=400,
            detail="Category name cannot be empty"
        )

    category = create_category(
        db,
        category_name
    )

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    return category