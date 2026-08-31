from pydantic import BaseModel


class ListingImageCreate(BaseModel):
    listing_id: int
    image_url: str


class ListingImageResponse(BaseModel):
    id: int
    listing_id: int
    image_url: str

    class Config:
        from_attributes = True