from pydantic import BaseModel


# ==================================================
# CREATE DEAL
# ==================================================

class DealCreate(BaseModel):

    listing_id: int

    meetup_location: str | None = None


# ==================================================
# UPDATE DEAL
# ==================================================

class DealUpdate(BaseModel):

    meetup_location: str | None = None

    status: str | None = None

    buyer_confirmed: bool | None = None

    seller_confirmed: bool | None = None


# ==================================================
# RESPONSE
# ==================================================

class DealResponse(BaseModel):

    id: int

    listing_id: int

    buyer_id: int

    seller_id: int

    meetup_location: str | None = None

    status: str

    buyer_confirmed: bool

    seller_confirmed: bool

    class Config:
        from_attributes = True