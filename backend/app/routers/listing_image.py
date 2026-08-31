from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user

from app.database.database import SessionLocal
from app.schemas.listing_image import (
    ListingImageCreate,
    ListingImageResponse
)
from app.services.listing_image_service import (
    create_listing_image,
    get_listing_images,
    delete_listing_image
)


router = APIRouter(
    prefix="/listing-images",
    tags=["Listing Images"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ListingImageResponse)
def add_listing_image(
    image_data: ListingImageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    
    image = create_listing_image(
    db,
    image_data.listing_id,
    image_data.image_url,
    current_user.id
)
    if not image:
     raise HTTPException(
        status_code=404,
        detail="Listing not found or you are not the owner"
    )

    return image


@router.get(
    "/{listing_id}",
    response_model=list[ListingImageResponse]
)
def get_images(
    listing_id: int,
    db: Session = Depends(get_db)
):
    return get_listing_images(db, listing_id)


@router.delete("/{image_id}")
def remove_listing_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    image = delete_listing_image(
    db,
    image_id,
    current_user.id
)

    if not image:
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    return {
        "message": "Image deleted successfully"
    }