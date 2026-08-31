from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.auth import get_current_user
from app.schemas.favorite import FavoriteResponse

from app.services.favorite_service import (
    create_favorite,
    get_user_favorites,
    delete_favorite
)


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# ADD FAVORITE
# ==================================================

@router.post(
    "/",
    response_model=FavoriteResponse
)
def add_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    favorite = create_favorite(
        db,
        current_user.id,
        listing_id
    )

    if not favorite:
        raise HTTPException(
            status_code=400,
            detail="Listing already added to favorites"
        )

    return {
        "id": favorite.id,
        "user_id": favorite.user_id,
        "listing_id": favorite.listing_id,
        "listing_title": (
            favorite.listing.title
            if favorite.listing
            else None
        )
    }


# ==================================================
# GET FAVORITES
# ==================================================

@router.get(
    "/",
    response_model=list[FavoriteResponse]
)
def get_favorites(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    favorites = get_user_favorites(
        db,
        current_user.id
    )

    result = []

    for favorite in favorites:

        result.append({
            "id": favorite.id,
            "user_id": favorite.user_id,
            "listing_id": favorite.listing_id,
            "listing_title": (
                favorite.listing.title
                if favorite.listing
                else None
            )
        })

    return result


# ==================================================
# DELETE FAVORITE
# ==================================================

@router.delete("/{listing_id}")
def remove_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    favorite = delete_favorite(
        db,
        current_user.id,
        listing_id
    )

    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Favorite not found"
        )

    return {
        "message": "Favorite removed successfully"
    }