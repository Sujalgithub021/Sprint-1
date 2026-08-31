from sqlalchemy.orm import Session, selectinload

from app.models import Listing
from app.schemas.listing import ListingCreate, ListingUpdate

def get_all_listings(db: Session):
    return (
        db.query(Listing)
        .options(
            selectinload(Listing.user),
            selectinload(Listing.category),
            selectinload(Listing.images)
        )
        .filter(Listing.status == "Available")
        .all()
    )
    

def get_listing_by_id(db: Session, listing_id: int):
    return (
        db.query(Listing)
        .options(
            selectinload(Listing.user),
            selectinload(Listing.category),
            selectinload(Listing.images)
        )
        .filter(Listing.id == listing_id)
        .first()
    )

def update_listing(
    db: Session,
    listing_id: int,
    listing_data: ListingUpdate,
    user_id: int
):
    listing = (
    db.query(Listing)
    .filter(
        Listing.id == listing_id,
        Listing.user_id == user_id
    )
    .first()
)

    if not listing:
        return None

    update_data = listing_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(listing, key, value)

    db.commit()
    db.refresh(listing)

    return listing

def delete_listing(
    db: Session,
    listing_id: int,
    user_id: int
):
    listing = (
    db.query(Listing)
    .filter(
        Listing.id == listing_id,
        Listing.user_id == user_id
    )
    .first()
)

    if not listing:
        return None

    listing.status = "Removed"

    db.commit()

    return listing

def create_listing(
    db: Session,
    listing_data: ListingCreate,
    user_id: int
):
    listing = Listing(
        user_id=user_id,
        category_id=listing_data.category_id,
        title=listing_data.title,
        description=listing_data.description,
        price=listing_data.price,
        condition=listing_data.condition,
        listing_type=listing_data.listing_type,
        status="Available",
        latitude=listing_data.latitude,
        longitude=listing_data.longitude
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return (
        db.query(Listing)
        .options(
            selectinload(Listing.user),
            selectinload(Listing.category),
            selectinload(Listing.images)
        )
        .filter(Listing.id == listing.id)
        .first()
    )

# GET CURRENT USER'S LISTINGS

def get_my_listings(
    db: Session,
    user_id: int
):
    return (
        db.query(Listing)
        .options(
            selectinload(Listing.user),
            selectinload(Listing.category),
            selectinload(Listing.images)
        )
        .filter(
            Listing.user_id == user_id,
            Listing.status == "Available"
        )
        .order_by(Listing.id.desc())
        .all()
    )


from sqlalchemy import func


def get_nearby_listings(
    db: Session,
    latitude: float,
    longitude: float,
    radius_km: float = 10
):
    """
    Find available listings within the given radius.

    radius_km = distance in kilometers.
    """

    # Approximate conversion:
    # 1 degree latitude ≈ 111 km

    lat_range = radius_km / 111

    # Prevent division by zero near the poles
    import math

    lon_range = radius_km / (
        111 * max(
            math.cos(
                math.radians(latitude)
            ),
            0.01
        )
    )

    return (
        db.query(Listing)
        .options(
            selectinload(Listing.user),
            selectinload(Listing.category),
            selectinload(Listing.images)
        )
        .filter(
            Listing.status == "Available",

            Listing.latitude.isnot(None),

            Listing.longitude.isnot(None),

            Listing.latitude >=
                latitude - lat_range,

            Listing.latitude <=
                latitude + lat_range,

            Listing.longitude >=
                longitude - lon_range,

            Listing.longitude <=
                longitude + lon_range
        )
        .all()
    )

