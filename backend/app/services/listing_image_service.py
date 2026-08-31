from sqlalchemy.orm import Session

from app.models import ListingImage, Listing

def create_listing_image(
    db: Session,
    listing_id: int,
    image_url: str,
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

    image = ListingImage(
        listing_id=listing_id,
        image_url=image_url
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image


def get_listing_images(
    db: Session,
    listing_id: int
):
    return (
        db.query(ListingImage)
        .filter(ListingImage.listing_id == listing_id)
        .all()
    )


def delete_listing_image(
    db: Session,
    image_id: int,
    user_id: int
):
    image = (
    db.query(ListingImage)
    .join(Listing)
    .filter(
        ListingImage.id == image_id,
        Listing.user_id == user_id
    )
    .first()
)

    if not image:
        return None

    db.delete(image)
    db.commit()

    return image