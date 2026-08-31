from sqlalchemy import (Column,Integer,String,Text,Numeric,Enum,DECIMAL,DateTime,ForeignKey)

from sqlalchemy.orm import relationship

from app.database.database import Base

class Listing(Base):
    __tablename__ = "listings"

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
    category_id = Column(
    Integer,
    ForeignKey("categories.id"),
    nullable=False,
    index=True
)
    title = Column(
    String(150),
    nullable=False
)

    description = Column(
    Text,
    nullable=True
)

    price = Column(
    DECIMAL(10, 2),
    nullable=False
)

    condition = Column(
    Enum(
        "New",
        "Like New",
        "Good",
        "Used"
    ),
    nullable=False
)

    listing_type = Column(
    Enum(
        "Sell",
        "Exchange"
    ),
    nullable=False,
    default="Sell"
)

    status = Column(
    Enum(
        "Available",
        "Sold",
        "Exchanged",
        "Removed"
    ),
    nullable=False,
    default="Available"
)

    latitude = Column(
    DECIMAL(10, 8),
    nullable=True
)

    longitude = Column(
    DECIMAL(11, 8),
    nullable=True
)

    created_at = Column(
    DateTime
)

    user = relationship("User", back_populates="listings")

    category = relationship("Category", back_populates="listings")

    images = relationship(
    "ListingImage",
    back_populates="listing"
)

    favorites = relationship(
    "Favorite",
    back_populates="listing"
)

    



