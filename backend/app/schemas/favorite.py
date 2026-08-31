from pydantic import BaseModel


class FavoriteCreate(BaseModel):
    user_id: int
    listing_id: int


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    listing_id: int

    # Product name
    listing_title: str | None = None

    class Config:
        from_attributes = True