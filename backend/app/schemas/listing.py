from pydantic import BaseModel
from typing import List


# CREATE LISTING

class ListingCreate(BaseModel):
    category_id: int
    title: str
    description: str | None = None
    price: float
    condition: str
    listing_type: str = "Sell"
    latitude: float | None = None
    longitude: float | None = None


# UPDATE LISTING

class ListingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    condition: str | None = None
    listing_type: str | None = None
    latitude: float | None = None
    longitude: float | None = None



# LISTING RESPONSE


class ListingResponse(BaseModel):
    id: int

    title: str

    description: str | None

    price: float

    condition: str

    listing_type: str

    status: str

    seller: str

    seller_id: int

    category: str

    images: List[str] = []

    class Config:
        from_attributes = True