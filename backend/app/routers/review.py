from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user

from app.database.database import SessionLocal
from app.schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse
)
from app.services.review_service import (
    get_all_reviews,
    get_review_by_id,
    create_review,
    update_review,
    delete_review
)


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ReviewResponse])
def get_reviews(db: Session = Depends(get_db)):

    return get_all_reviews(db)


@router.post("/", response_model=ReviewResponse)
def create_new_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    review = create_review(
        db,
        review_data,
        current_user.id
    )

    if not review:
     raise HTTPException(
        status_code=400,
        detail="You cannot review this deal. The deal must be completed, you must be the buyer, and you must not have reviewed it already."
    )

    return review


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(
    review_id: int,
    db: Session = Depends(get_db)
):

    review = get_review_by_id(db, review_id)

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review_route(
    review_id: int,
    review_data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    review = update_review(
        db,
        review_id,
        review_data,
        current_user.id
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    return review


@router.delete("/{review_id}")
def delete_review_route(
    review_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    review = delete_review(
        db,
        review_id,
        current_user.id
    )

    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    return {
        "message": "Review deleted successfully"
    }