from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import SessionLocal

from app.schemas.exchange import (
    ExchangeCreate,
    ExchangeUpdate,
    ExchangeResponse
)

from app.services.exchange_service import (
    get_all_exchanges,
    get_exchange_by_id,
    create_exchange,
    update_exchange,
    delete_exchange
)


router = APIRouter(
    prefix="/exchanges",
    tags=["Exchanges"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==================================================
# CONVERT EXCHANGE TO RESPONSE
# ==================================================

def exchange_response(exchange):

    return ExchangeResponse(

        id=exchange.id,

        requester_id=
            exchange.requester_id,

        receiver_id=
            exchange.receiver_id,

        offered_listing_id=
            exchange.offered_listing_id,

        requested_listing_id=
            exchange.requested_listing_id,

        status=
            exchange.status,

        requester_name=
            exchange.requester.name,

        receiver_name=
            exchange.receiver.name,

        offered_listing_title=
            exchange.offered_listing.title,

        requested_listing_title=
            exchange.requested_listing.title
    )


# ==================================================
# GET MY EXCHANGES
# ==================================================

@router.get(
    "/",
    response_model=list[ExchangeResponse]
)
def get_exchanges(

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )

):

    exchanges = get_all_exchanges(

        db,

        current_user.id

    )

    return [
        exchange_response(exchange)
        for exchange in exchanges
    ]


# ==================================================
# GET ONE EXCHANGE
# ==================================================

@router.get(
    "/{exchange_id}",
    response_model=ExchangeResponse
)
def get_exchange(

    exchange_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )

):

    exchange = get_exchange_by_id(

        db,

        exchange_id,

        current_user.id

    )

    if not exchange:

        raise HTTPException(

            status_code=404,

            detail="Exchange not found"

        )

    return exchange_response(exchange)


# ==================================================
# CREATE EXCHANGE
# ==================================================

@router.post(
    "/",
    response_model=ExchangeResponse
)
def create_new_exchange(

    exchange_data: ExchangeCreate,

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )

):

    exchange = create_exchange(

        db,

        exchange_data,

        current_user.id

    )

    if not exchange:

        raise HTTPException(

            status_code=400,

            detail="Invalid exchange request"

        )

    return exchange_response(exchange)


# ==================================================
# UPDATE EXCHANGE
# ==================================================

@router.put(
    "/{exchange_id}",
    response_model=ExchangeResponse
)
def update_exchange_route(

    exchange_id: int,

    exchange_data: ExchangeUpdate,

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )

):

    exchange = update_exchange(

        db,

        exchange_id,

        exchange_data,

        current_user.id

    )

    if not exchange:

        raise HTTPException(

            status_code=403,

            detail="You are not allowed to perform this action"

        )

    return exchange_response(exchange)


# ==================================================
# DELETE EXCHANGE
# ==================================================

@router.delete(
    "/{exchange_id}"
)
def delete_exchange_route(

    exchange_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(
        get_current_user
    )

):

    exchange = delete_exchange(

        db,

        exchange_id,

        current_user.id

    )

    if not exchange:

        raise HTTPException(

            status_code=404,

            detail="Exchange not found"

        )

    return {
        "message":
            "Exchange deleted successfully"
    }