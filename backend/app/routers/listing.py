from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.auth import get_current_user

from app.schemas.listing import (
    ListingResponse,
    ListingCreate,
    ListingUpdate
)

from app.services.listing_service import (
    get_all_listings,
    get_listing_by_id,
    get_my_listings,
    get_nearby_listings,
    create_listing,
    update_listing,
    delete_listing
)


router = APIRouter(
    prefix="/listings",
    tags=["Listings"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# GET ALL LISTINGS
# ==================================================

@router.get(
    "/",
    response_model=list[ListingResponse]
)
def get_listings(
    db: Session = Depends(get_db)
):

    listings = get_all_listings(db)

    return [
        ListingResponse(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            price=float(listing.price),
            condition=listing.condition,
            listing_type=listing.listing_type,
            status=listing.status,
            seller=listing.user.name,
            seller_id=listing.user_id,
            category=listing.category.name,
            images=[
                image.image_url
                for image in listing.images
            ]
        )
        for listing in listings
    ]


# ==================================================
# GET MY LISTINGS
# IMPORTANT:
# This MUST be before /{listing_id}
# ==================================================

@router.get(
    "/my",
    response_model=list[ListingResponse]
)
def get_my_listings_route(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    listings = get_my_listings(
        db,
        current_user.id
    )

    return [
        ListingResponse(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            price=float(listing.price),
            condition=listing.condition,
            listing_type=listing.listing_type,
            status=listing.status,
            seller=listing.user.name,
            seller_id=listing.user_id,
            category=listing.category.name,
            images=[
                image.image_url
                for image in listing.images
            ]
        )
        for listing in listings
    ]


# ==================================================
# GET ONE LISTING
# ==================================================

# ==================================================
# GET NEARBY LISTINGS
# IMPORTANT:
# This MUST come before /{listing_id}
# ==================================================

@router.get(
    "/nearby",
    response_model=list[ListingResponse]
)
def get_nearby_listings_route(
    latitude: float,
    longitude: float,
    radius: float = 10,
    db: Session = Depends(get_db)
):

    listings = get_nearby_listings(
        db,
        latitude,
        longitude,
        radius
    )

    return [
        ListingResponse(
            id=listing.id,
            title=listing.title,
            description=listing.description,
            price=float(listing.price),
            condition=listing.condition,
            listing_type=listing.listing_type,
            status=listing.status,
            seller=listing.user.name,
            seller_id=listing.user_id,
            category=listing.category.name,
            images=[
                image.image_url
                for image in listing.images
            ]
        )
        for listing in listings
    ]

@router.get(
    "/{listing_id}",
    response_model=ListingResponse
)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db)
):

    listing = get_listing_by_id(
        db,
        listing_id
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found"
        )

    return ListingResponse(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        price=float(listing.price),
        condition=listing.condition,
        listing_type=listing.listing_type,
        status=listing.status,
        seller=listing.user.name,
        seller_id=listing.user_id,
        category=listing.category.name,
        images=[
            image.image_url
            for image in listing.images
        ]
    )


# ==================================================
# CREATE LISTING
# ==================================================

@router.post(
    "/",
    response_model=ListingResponse
)
def create_new_listing(
    listing_data: ListingCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    listing = create_listing(
        db,
        listing_data,
        current_user.id
    )

    if not listing:
        raise HTTPException(
            status_code=400,
            detail="Unable to create listing"
        )

    return ListingResponse(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        price=float(listing.price),
        condition=listing.condition,
        listing_type=listing.listing_type,
        status=listing.status,
        seller=listing.user.name,
        seller_id=listing.user_id,
        category=listing.category.name,
        images=[
            image.image_url
            for image in listing.images
        ]
    )


# ==================================================
# UPDATE LISTING
# ==================================================

@router.put(
    "/{listing_id}",
    response_model=ListingResponse
)
def update_listing_route(
    listing_id: int,
    listing_data: ListingUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    listing = update_listing(
        db,
        listing_id,
        listing_data,
        current_user.id
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found"
        )

    return ListingResponse(
        id=listing.id,
        title=listing.title,
        description=listing.description,
        price=float(listing.price),
        condition=listing.condition,
        listing_type=listing.listing_type,
        status=listing.status,
        seller=listing.user.name,
        seller_id=listing.user_id,
        category=listing.category.name,
        images=[
            image.image_url
            for image in listing.images
        ]
    )


# ==================================================
# DELETE LISTING
# ==================================================

@router.delete(
    "/{listing_id}"
)
def delete_listing_route(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    listing = delete_listing(
        db,
        listing_id,
        current_user.id
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found"
        )

    return {
        "message": "Listing removed successfully",
        "listing_id": listing.id
    }