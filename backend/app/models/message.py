from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
        index=True
    )

    messages = Column(
    "message",
    Text,
    nullable=False
)

    created_at = Column(
    DateTime,
    server_default=func.now()
)

    sender = relationship(
    "User",
    foreign_keys=[sender_id]
)

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id]
    )

    listing = relationship(
        "Listing",
        foreign_keys=[listing_id]
    )