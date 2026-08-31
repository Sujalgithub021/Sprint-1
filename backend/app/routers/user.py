from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.auth import get_current_user
from app.schemas.user import UserCreate, UserUpdate, UserResponse

from app.services.user_service import (
    get_all_users,
    get_user_by_id,
    get_user_by_email,
    create_user,
    update_user,
    delete_user
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==================================================
# GET ALL USERS
# ==================================================

@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db)
):
    return get_all_users(db)


# ==================================================
# GET CURRENT LOGGED-IN USER
# ==================================================

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user=Depends(get_current_user)
):
    return current_user


# ==================================================
# GET USER BY ID
# ==================================================

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ==================================================
# CREATE USER
# ==================================================

@router.post("/", response_model=UserResponse)
def create_new_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = get_user_by_email(
        db,
        user_data.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return create_user(db, user_data)


# ==================================================
# UPDATE CURRENT USER
# ==================================================

@router.put("/{user_id}", response_model=UserResponse)
def update_user_route(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own account"
        )

    user = update_user(
        db,
        user_id,
        user_data
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# ==================================================
# DELETE USER
# ==================================================

@router.delete("/{user_id}")
def delete_user_route(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own account"
        )

    user = delete_user(
        db,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "message": "User deleted successfully"
    }