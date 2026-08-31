from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship 

from app.database.database import Base


class Exchange(Base):
    __tablename__ = "exchanges"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    requester_id = Column(
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

    offered_listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
        index=True
    )

    requested_listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
        index=True
    )

    status = Column(
        Enum(
            "Pending",
            "Accepted",
            "Rejected",
            "Completed",
            "Cancelled"
        ),
        default="Pending"
    )

    created_at = Column(
        DateTime
    )

    requester = relationship(
        "User",
        foreign_keys=[requester_id]
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id]
    )

    offered_listing = relationship(
        "Listing",
        foreign_keys=[offered_listing_id]
    )

    requested_listing = relationship(
        "Listing",
        foreign_keys=[requested_listing_id]
    )