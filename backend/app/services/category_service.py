from sqlalchemy.orm import Session

from app.models import Category


def get_all_categories(db: Session):
    return (
        db.query(Category)
        .order_by(Category.name)
        .all()
    )


def get_category_by_id(
    db: Session,
    category_id: int
):
    return (
        db.query(Category)
        .filter(
            Category.id == category_id
        )
        .first()
    )


def create_category(
    db: Session,
    category_name: str
):
    existing_category = (
        db.query(Category)
        .filter(
            Category.name == category_name
        )
        .first()
    )

    if existing_category:
        return None

    category = Category(
        name=category_name
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return category