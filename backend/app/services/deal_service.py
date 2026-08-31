from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Deal, Listing
from app.schemas.deal import DealCreate, DealUpdate


# ==================================================
# GET ALL DEALS
# ==================================================

def get_all_deals(
    db: Session,
    user_id: int
):
    return (
        db.query(Deal)
        .filter(
            (Deal.buyer_id == user_id) |
            (Deal.seller_id == user_id)
        )
        .order_by(Deal.id.desc())
        .all()
    )


# ==================================================
# GET ONE DEAL
# ==================================================

def get_deal_by_id(
    db: Session,
    deal_id: int,
    user_id: int
):
    return (
        db.query(Deal)
        .filter(
            Deal.id == deal_id,
            (Deal.buyer_id == user_id) |
            (Deal.seller_id == user_id)
        )
        .first()
    )


# ==================================================
# CREATE DEAL
# ==================================================

def create_deal(
    db: Session,
    deal_data: DealCreate,
    user_id: int
):

    listing = (
        db.query(Listing)
        .filter(
            Listing.id == deal_data.listing_id
        )
        .first()
    )

    if not listing:
        return None

    # Logged-in user = buyer
    buyer_id = user_id

    # Listing owner = seller
    seller_id = listing.user_id

    # Cannot buy own listing
    if buyer_id == seller_id:
        return None

    # Listing must be available
    if listing.status != "Available":
        return None

    deal = Deal(
        listing_id=listing.id,
        buyer_id=buyer_id,
        seller_id=seller_id,
        meetup_location=deal_data.meetup_location,
        status="Pending",
        buyer_confirmed=False,
        seller_confirmed=False,
        created_at=datetime.utcnow()
    )

    db.add(deal)

    db.commit()

    db.refresh(deal)

    return deal


# ==================================================
# UPDATE DEAL
# ==================================================

def update_deal(
    db: Session,
    deal_id: int,
    deal_data: DealUpdate,
    user_id: int
):

    # --------------------------------------------------
    # FIND DEAL
    # --------------------------------------------------

    deal = (
        db.query(Deal)
        .filter(
            Deal.id == deal_id,
            (Deal.buyer_id == user_id) |
            (Deal.seller_id == user_id)
        )
        .first()
    )

    if not deal:
        return None

    print()
    print("========================================")
    print("UPDATE DEAL")
    print("========================================")

    print("Deal ID:", deal.id)
    print("Current User:", user_id)
    print("Buyer ID:", deal.buyer_id)
    print("Seller ID:", deal.seller_id)

    print(
        "Received:",
        deal_data.model_dump(exclude_unset=True)
    )

    print(
        "BEFORE:",
        "buyer_confirmed =", deal.buyer_confirmed,
        "seller_confirmed =", deal.seller_confirmed,
        "status =", deal.status
    )

    # --------------------------------------------------
    # COMPLETED DEAL CANNOT BE CHANGED
    # --------------------------------------------------

    if deal.status == "Completed":

        db.rollback()

        return None

    # ==================================================
    # CANCEL DEAL
    # ==================================================

    if deal_data.status == "Cancelled":

        deal.status = "Cancelled"

        db.commit()

        db.refresh(deal)

        return deal

    # ==================================================
    # CONFIRM MEETUP
    # ==================================================

    if (
        deal_data.buyer_confirmed is True
        or
        deal_data.seller_confirmed is True
        or
        deal_data.status == "Meetup"
    ):

        # ----------------------------------------------
        # BUYER CONFIRMATION
        # ----------------------------------------------

        if deal_data.buyer_confirmed is True:

            # Only buyer can set buyer_confirmed
            if user_id != deal.buyer_id:

                db.rollback()

                return None

            deal.buyer_confirmed = True

            print("BUYER CONFIRMED")

        # ----------------------------------------------
        # SELLER CONFIRMATION
        # ----------------------------------------------

        if deal_data.seller_confirmed is True:

            # Only seller can set seller_confirmed
            if user_id != deal.seller_id:

                db.rollback()

                return None

            deal.seller_confirmed = True

            print("SELLER CONFIRMED")

        # ----------------------------------------------
        # OLD FRONTEND SUPPORT
        # ----------------------------------------------
        #
        # If an old frontend sends:
        #
        # { "status": "Meetup" }
        #
        # determine who is confirming.
        #

        if (
            deal_data.status == "Meetup"
            and
            deal_data.buyer_confirmed is None
            and
            deal_data.seller_confirmed is None
        ):

            if user_id == deal.buyer_id:

                deal.buyer_confirmed = True

                print(
                    "BUYER CONFIRMED "
                    "(status fallback)"
                )

            elif user_id == deal.seller_id:

                deal.seller_confirmed = True

                print(
                    "SELLER CONFIRMED "
                    "(status fallback)"
                )

            else:

                db.rollback()

                return None

        # ----------------------------------------------
        # BOTH CONFIRMED
        # ----------------------------------------------

        if (
            deal.buyer_confirmed
            and
            deal.seller_confirmed
        ):

            deal.status = "Meetup"

            print("BOTH USERS CONFIRMED")
            print("STATUS = Meetup")

        else:

            # Only one person confirmed
            deal.status = "Pending"

            print("ONLY ONE USER CONFIRMED")

    # ==================================================
    # CHANGE MEETUP LOCATION
    # ==================================================

    if deal_data.meetup_location is not None:

        # Location locked after both confirmations
        if (
            deal.buyer_confirmed
            and
            deal.seller_confirmed
        ):

            db.rollback()

            return None

        # Cannot change cancelled/completed deal
        if deal.status in [
            "Cancelled",
            "Completed"
        ]:

            db.rollback()

            return None

        location = deal_data.meetup_location.strip()

        if not location:

            db.rollback()

            return None

        deal.meetup_location = location

    # ==================================================
    # COMPLETE DEAL
    # ==================================================

    if deal_data.status == "Completed":

        # Only seller can complete
        if user_id != deal.seller_id:

            db.rollback()

            return None

        # Both must confirm
        if not (
            deal.buyer_confirmed
            and
            deal.seller_confirmed
        ):

            db.rollback()

            return None

        # Must be Meetup
        if deal.status != "Meetup":

            db.rollback()

            return None

        # Complete
        deal.status = "Completed"

        deal.completed_at = datetime.utcnow()

        # ----------------------------------------------
        # MARK LISTING SOLD
        # ----------------------------------------------

        listing = (
            db.query(Listing)
            .filter(
                Listing.id == deal.listing_id
            )
            .first()
        )

        if listing:

            listing.status = "Sold"

    # ==================================================
    # SAVE
    # ==================================================

    db.commit()

    db.refresh(deal)

    print(
        "AFTER:",
        "buyer_confirmed =", deal.buyer_confirmed,
        "seller_confirmed =", deal.seller_confirmed,
        "status =", deal.status
    )

    print("========================================")

    return deal


# ==================================================
# DELETE DEAL
# ==================================================

def delete_deal(
    db: Session,
    deal_id: int,
    user_id: int
):

    deal = (
        db.query(Deal)
        .filter(
            Deal.id == deal_id,
            (Deal.buyer_id == user_id) |
            (Deal.seller_id == user_id)
        )
        .first()
    )

    if not deal:
        return None

    db.delete(deal)

    db.commit()

    return deal