from sqlalchemy.orm import Session

from app.models import Favorite


def create_favorite(
    db: Session,
    user_id: int,
    listing_id: int
):
    existing_favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id,
            Favorite.listing_id == listing_id
        )
        .first()
    )

    if existing_favorite:
        return None

    favorite = Favorite(
        user_id=user_id,
        listing_id=listing_id
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return favorite


def get_user_favorites(
    db: Session,
    user_id: int
):
    return (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id
        )
        .all()
    )


def delete_favorite(
    db: Session,
    user_id: int,
    listing_id: int
):
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == user_id,
            Favorite.listing_id == listing_id
        )
        .first()
    )

    if not favorite:
        return None

    db.delete(favorite)
    db.commit()

    return favorite