from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    user_id = Column(
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

    created_at = Column(
        DateTime
    )

    user = relationship(
        "User",
        back_populates="favorites"
    )

    listing = relationship(
        "Listing",
        back_populates="favorites"
    )