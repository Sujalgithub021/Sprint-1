from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    deal_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None


class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    deal_id: int
    reviewer_id: int
    reviewed_user_id: int
    rating: int
    comment: str | None = None

    class Config:
        from_attributes = True