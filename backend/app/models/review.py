from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship

from app.database.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    deal_id = Column(
        Integer,
        ForeignKey("deals.id"),
        nullable=False,
        index=True
    )

    reviewer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    reviewed_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    rating = Column(
        Integer,
        nullable=False
    )

    comment = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime
    )

    deal = relationship(
        "Deal",
        foreign_keys=[deal_id]
    )

    reviewer = relationship(
        "User",
        foreign_keys=[reviewer_id]
    )

    reviewed_user = relationship(
        "User",
        foreign_keys=[reviewed_user_id]
    )