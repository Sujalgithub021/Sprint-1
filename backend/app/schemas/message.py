from pydantic import BaseModel


class MessageCreate(BaseModel):
    receiver_id: int
    listing_id: int
    messages: str


class MessageUpdate(BaseModel):
    messages: str


class MessageResponse(BaseModel):
    id: int

    sender_id: int
    sender_name: str

    receiver_id: int
    receiver_name: str

    listing_id: int
    listing_title: str

    messages: str

    class Config:
        from_attributes = True