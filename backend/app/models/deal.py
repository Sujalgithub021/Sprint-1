from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Enum,
    DateTime,
    Boolean
)

from sqlalchemy.orm import relationship

from app.database.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
        index=True
    )

    buyer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    seller_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    meetup_location = Column(
        String(300),
        nullable=True
    )

    status = Column(
        Enum(
            "Pending",
            "Meetup",
            "Completed",
            "Cancelled"
        ),
        nullable=False,
        default="Pending"
    )

    buyer_confirmed = Column(
        Boolean,
        nullable=False,
        default=False
    )

    seller_confirmed = Column(
        Boolean,
        nullable=False,
        default=False
    )

    created_at = Column(
        DateTime
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )

    listing = relationship(
        "Listing",
        foreign_keys=[listing_id]
    )

    buyer = relationship(
        "User",
        foreign_keys=[buyer_id]
    )

    seller = relationship(
        "User",
        foreign_keys=[seller_id]
    )