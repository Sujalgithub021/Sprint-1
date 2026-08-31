from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    college: str
    course: str
    year: int | None = None
    profile_image: str | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    college: str
    course: str
    year: int | None
    profile_image: str | None
    is_verified: bool

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: str
    email: str
    college: str
    course: str
    year: int | None = None
    profile_image: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str