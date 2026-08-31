from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.schemas.user import UserLogin
from app.services.user_service import authenticate_user
from app.auth import create_access_token, get_current_user
from app.schemas.user import UserLogin, UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db,
        user_data.email,
        user_data.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(user.id)
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user = Depends(get_current_user)
):
    return current_user

# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwiZXhwIjoxNzg4MDc2NjEyfQ.eSxIpAh0r8cJNK-f0JkQ3zltboYrapmofJn1IahML8w