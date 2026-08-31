from sqlalchemy.orm import Session

from app.models import Review, Deal
from app.schemas.review import ReviewCreate, ReviewUpdate


def get_all_reviews(db: Session):
    return (
        db.query(Review)
        .all()
    )


def get_review_by_id(db: Session, review_id: int):
    return (
        db.query(Review)
        .filter(Review.id == review_id)
        .first()
    )


def create_review(
    db: Session,
    review_data: ReviewCreate,
    reviewer_id: int
):
    # Find the deal
    deal = (
        db.query(Deal)
        .filter(
            Deal.id == review_data.deal_id
        )
        .first()
    )

    if not deal:
        return None

    # Deal must be completed
    if deal.status != "Completed":
        return None

    # Only the buyer can review the seller
    if deal.buyer_id != reviewer_id:
        return None

    # Check if this user already reviewed this deal
    existing_review = (
        db.query(Review)
        .filter(
            Review.deal_id == review_data.deal_id,
            Review.reviewer_id == reviewer_id
        )
        .first()
    )

    if existing_review:
        return None

    # Automatically review the seller
    review = Review(
        deal_id=deal.id,
        reviewer_id=reviewer_id,
        reviewed_user_id=deal.seller_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review


def update_review(
    db: Session,
    review_id: int,
    review_data: ReviewUpdate,
    reviewer_id: int
):
    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.reviewer_id == reviewer_id
)
        .first()
    )

    if not review:
        return None

    update_data = review_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(review, key, value)

    db.commit()
    db.refresh(review)

    return review


def delete_review(
    db: Session,
    review_id: int,
    reviewer_id: int
):

    review = (
        db.query(Review)
        .filter(
    Review.id == review_id,
    Review.reviewer_id == reviewer_id
)
        .first()
    )

    if not review:
        return None

    db.delete(review)
    db.commit()

    return review