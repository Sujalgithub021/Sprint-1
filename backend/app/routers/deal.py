from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user

from app.database.database import SessionLocal

from app.schemas.deal import (
    DealCreate,
    DealUpdate,
    DealResponse
)

from app.services.deal_service import (
    get_all_deals,
    get_deal_by_id,
    create_deal,
    update_deal,
    delete_deal
)


router = APIRouter(
    prefix="/deals",
    tags=["Deals"]
)


# ==================================================
# DATABASE
# ==================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==================================================
# GET ALL DEALS
# ==================================================

@router.get(
    "/",
    response_model=list[DealResponse]
)
def get_deals(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return get_all_deals(
        db,
        current_user.id
    )


# ==================================================
# GET ONE DEAL
# ==================================================

@router.get(
    "/{deal_id}",
    response_model=DealResponse
)
def get_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    deal = get_deal_by_id(
        db,
        deal_id,
        current_user.id
    )

    if not deal:

        raise HTTPException(
            status_code=404,
            detail="Deal not found"
        )

    return deal


# ==================================================
# CREATE DEAL
# ==================================================

@router.post(
    "/",
    response_model=DealResponse
)
def create_new_deal(
    deal_data: DealCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    deal = create_deal(
        db,
        deal_data,
        current_user.id
    )

    if not deal:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid listing or "
                "you cannot create a deal "
                "with your own listing"
            )
        )

    return deal


# ==================================================
# UPDATE DEAL
# ==================================================

@router.put(
    "/{deal_id}",
    response_model=DealResponse
)
def update_deal_route(
    deal_id: int,
    deal_data: DealUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    print()
    print("========================================")
    print("DEAL ROUTER")
    print("========================================")

    print("Deal ID:", deal_id)

    print(
        "Current User ID:",
        current_user.id
    )

    print(
        "Request:",
        deal_data.model_dump(
            exclude_unset=True
        )
    )

    deal = update_deal(
        db,
        deal_id,
        deal_data,
        current_user.id
    )

    if not deal:

        raise HTTPException(
            status_code=404,
            detail=(
                "Deal not found or "
                "you are not allowed "
                "to update this deal"
            )
        )

    print(
        "Response:",
        {
            "id": deal.id,
            "buyer_confirmed": deal.buyer_confirmed,
            "seller_confirmed": deal.seller_confirmed,
            "status": deal.status
        }
    )

    print("========================================")

    return deal


# ==================================================
# DELETE DEAL
# ==================================================

@router.delete(
    "/{deal_id}"
)
def delete_deal_route(
    deal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    deal = delete_deal(
        db,
        deal_id,
        current_user.id
    )

    if not deal:

        raise HTTPException(
            status_code=404,
            detail="Deal not found"
        )

    return {
        "message": "Deal deleted successfully"
    }