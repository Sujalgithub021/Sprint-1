from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base


class ListingImage(Base):
    __tablename__ = "listing_images"

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

    image_url = Column(
        String(500),
        nullable=False
    )

    listing = relationship(
        "Listing",
        back_populates="images"
    )