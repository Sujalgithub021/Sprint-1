from sqlalchemy.orm import Session

from passlib.context import CryptContext
from app.models import User
from app.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def verify_password(
    plain_password: str,
    hashed_password: str
):
    return pwd_context.verify(
        plain_password,
        hashed_password
    )

def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password
    ):
        return None

    return user


def get_all_users(db: Session):
    return (
        db.query(User)
        .order_by(User.id)
        .all()
    )


def get_user_by_id(db: Session, user_id: int):
    return (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )


def get_user_by_email(db: Session, email: str):
    return (
        db.query(User)
        .filter(User.email == email)
        .first()
    )


def create_user(
    db: Session,
    user_data: UserCreate
):
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=pwd_context.hash(user_data.password),
        college=user_data.college,
        course=user_data.course,
        year=user_data.year,
        profile_image=user_data.profile_image
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def update_user(
    db: Session,
    user_id: int,
    user_data: UserUpdate
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return None

    user.name = user_data.name
    user.email = user_data.email
    user.college = user_data.college
    user.course = user_data.course
    user.year = user_data.year
    user.profile_image = user_data.profile_image

    db.commit()
    db.refresh(user)

    return user

def delete_user(
    db: Session,
    user_id: int
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        return None

    db.delete(user)
    db.commit()

    return user