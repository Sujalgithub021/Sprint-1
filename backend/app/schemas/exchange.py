from pydantic import BaseModel, Field


class ExchangeCreate(BaseModel):
    receiver_id: int
    offered_listing_id: int
    requested_listing_id: int


class ExchangeUpdate(BaseModel):
    status: str = Field(
        ...,
        pattern="^(Pending|Accepted|Rejected|Completed|Cancelled)$"
    )


class ExchangeResponse(BaseModel):
    id: int

    requester_id: int
    receiver_id: int

    offered_listing_id: int
    requested_listing_id: int

    status: str

    # Names for UI
    requester_name: str
    receiver_name: str

    offered_listing_title: str
    requested_listing_title: str

    class Config:
        from_attributes = True