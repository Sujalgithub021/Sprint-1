from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user

from app.database.database import SessionLocal
from app.schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse
)
from app.services.message_service import (
    get_all_messages,
    get_message_by_id,
    create_message,
    update_message,
    delete_message
)


router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[MessageResponse])
def get_messages(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return get_all_messages(
        db,
        current_user.id
    )


@router.get("/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    message = get_message_by_id(
        db,
        message_id,
        current_user.id
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return message


@router.post("/", response_model=MessageResponse)
def create_new_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    message = create_message(
        db,
        message_data,
        current_user.id
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Receiver or listing not found"
        )

    return message


@router.put("/{message_id}", response_model=MessageResponse)
def update_message_route(
    message_id: int,
    message_data: MessageUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    message = update_message(
        db,
        message_id,
        message_data,
        current_user.id
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return message


@router.delete("/{message_id}")
def delete_message_route(
    message_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    message = delete_message(
        db,
        message_id,
        current_user.id
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return {
        "message": "Message deleted successfully"
    }
