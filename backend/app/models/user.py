from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(
    Integer,
    primary_key=True,
    index=True,
    autoincrement=True
)
    name = Column(String(100), nullable=False)
    email = Column(
    String(150),
    nullable=False,
    unique=True,
    index=True
)
    password = Column(String(255), nullable=False)

    college = Column(String(150), nullable=False)

    course = Column(String(100), nullable=False)

    year = Column(Integer, nullable=True)

    profile_image = Column(String(255), nullable=True)

    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime)

    listings = relationship("Listing", back_populates="user")

    favorites = relationship(
    "Favorite",
    back_populates="user"
)