from sqlalchemy.orm import Session, joinedload

from app.models import Exchange, Listing
from app.schemas.exchange import (
    ExchangeCreate,
    ExchangeUpdate
)


# ==================================================
# GET MY EXCHANGES
# ==================================================

def get_all_exchanges(
    db: Session,
    user_id: int
):

    return (
        db.query(Exchange)
        .options(
            joinedload(Exchange.requester),
            joinedload(Exchange.receiver),
            joinedload(Exchange.offered_listing),
            joinedload(Exchange.requested_listing)
        )
        .filter(
            (
                Exchange.requester_id == user_id
            )
            |
            (
                Exchange.receiver_id == user_id
            )
        )
        .order_by(
            Exchange.id.desc()
        )
        .all()
    )


# ==================================================
# GET ONE EXCHANGE
# ==================================================

def get_exchange_by_id(
    db: Session,
    exchange_id: int,
    user_id: int
):

    return (
        db.query(Exchange)
        .options(
            joinedload(Exchange.requester),
            joinedload(Exchange.receiver),
            joinedload(Exchange.offered_listing),
            joinedload(Exchange.requested_listing)
        )
        .filter(
            Exchange.id == exchange_id,
            (
                (Exchange.requester_id == user_id)
                |
                (Exchange.receiver_id == user_id)
            )
        )
        .first()
    )


# ==================================================
# CREATE EXCHANGE
# ==================================================

def create_exchange(
    db: Session,
    exchange_data: ExchangeCreate,
    requester_id: int
):

    # ----------------------------------------------
    # GET OFFERED LISTING
    # ----------------------------------------------

    offered_listing = (
        db.query(Listing)
        .filter(
            Listing.id ==
            exchange_data.offered_listing_id
        )
        .first()
    )

    if not offered_listing:
        return None


    # ----------------------------------------------
    # GET REQUESTED LISTING
    # ----------------------------------------------

    requested_listing = (
        db.query(Listing)
        .filter(
            Listing.id ==
            exchange_data.requested_listing_id
        )
        .first()
    )

    if not requested_listing:
        return None


    # ----------------------------------------------
    # OFFERED ITEM MUST BELONG TO REQUESTER
    # ----------------------------------------------

    if offered_listing.user_id != requester_id:
        return None


    # ----------------------------------------------
    # REQUESTED ITEM MUST BELONG TO RECEIVER
    # ----------------------------------------------

    if (
        requested_listing.user_id
        != exchange_data.receiver_id
    ):
        return None


    # ----------------------------------------------
    # CANNOT EXCHANGE WITH YOURSELF
    # ----------------------------------------------

    if requester_id == exchange_data.receiver_id:
        return None


    # ----------------------------------------------
    # BOTH ITEMS MUST BE AVAILABLE
    # ----------------------------------------------

    if offered_listing.status != "Available":
        return None

    if requested_listing.status != "Available":
        return None


    # ----------------------------------------------
    # CHECK DUPLICATE PENDING REQUEST
    # ----------------------------------------------

    existing_exchange = (
        db.query(Exchange)
        .filter(
            Exchange.requester_id == requester_id,

            Exchange.receiver_id ==
                exchange_data.receiver_id,

            Exchange.offered_listing_id ==
                exchange_data.offered_listing_id,

            Exchange.requested_listing_id ==
                exchange_data.requested_listing_id,

            Exchange.status == "Pending"
        )
        .first()
    )

    if existing_exchange:
        return None


    # ----------------------------------------------
    # CREATE EXCHANGE
    # ----------------------------------------------

    exchange = Exchange(

        requester_id=requester_id,

        receiver_id=
            exchange_data.receiver_id,

        offered_listing_id=
            exchange_data.offered_listing_id,

        requested_listing_id=
            exchange_data.requested_listing_id,

        status="Pending"
    )


    db.add(exchange)
    db.commit()
    db.refresh(exchange)


    # ----------------------------------------------
    # LOAD RELATIONSHIPS
    # ----------------------------------------------

    return (
        db.query(Exchange)
        .options(
            joinedload(Exchange.requester),
            joinedload(Exchange.receiver),
            joinedload(Exchange.offered_listing),
            joinedload(Exchange.requested_listing)
        )
        .filter(
            Exchange.id == exchange.id
        )
        .first()
    )


# ==================================================
# UPDATE EXCHANGE
# ==================================================

def update_exchange(
    db: Session,
    exchange_id: int,
    exchange_data: ExchangeUpdate,
    user_id: int
):

    exchange = (
        db.query(Exchange)
        .filter(
            Exchange.id == exchange_id,
            (
                (Exchange.requester_id == user_id)
                |
                (Exchange.receiver_id == user_id)
            )
        )
        .first()
    )

    if not exchange:
        return None


    # ----------------------------------------------
    # ONLY RECEIVER CAN ACCEPT / REJECT
    # ----------------------------------------------

    if exchange_data.status in [
        "Accepted",
        "Rejected"
    ]:

        if user_id != exchange.receiver_id:
            return None


    # ----------------------------------------------
    # ONLY REQUESTER OR RECEIVER CAN CANCEL
    # ----------------------------------------------

    if exchange_data.status == "Cancelled":

        if (
            user_id != exchange.requester_id
            and
            user_id != exchange.receiver_id
        ):
            return None


    # ----------------------------------------------
    # COMPLETE
    # ----------------------------------------------

    if exchange_data.status == "Completed":

        if (
            user_id != exchange.requester_id
            and
            user_id != exchange.receiver_id
        ):
            return None

        if exchange.status != "Accepted":
            return None


    exchange.status = exchange_data.status

    db.commit()
    db.refresh(exchange)


    return (
        db.query(Exchange)
        .options(
            joinedload(Exchange.requester),
            joinedload(Exchange.receiver),
            joinedload(Exchange.offered_listing),
            joinedload(Exchange.requested_listing)
        )
        .filter(
            Exchange.id == exchange.id
        )
        .first()
    )


# ==================================================
# DELETE EXCHANGE
# ==================================================

def delete_exchange(
    db: Session,
    exchange_id: int,
    user_id: int
):

    exchange = (
        db.query(Exchange)
        .filter(
            Exchange.id == exchange_id,
            (
                (Exchange.requester_id == user_id)
                |
                (Exchange.receiver_id == user_id)
            )
        )
        .first()
    )

    if not exchange:
        return None


    db.delete(exchange)
    db.commit()

    return exchange