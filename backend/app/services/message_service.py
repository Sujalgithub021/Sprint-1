from sqlalchemy.orm import Session, aliased

from app.models import Message, User, Listing
from app.schemas.message import MessageCreate, MessageUpdate


def format_message(
    message,
    sender,
    receiver,
    listing
):
    return {
        "id": message.id,

        "sender_id": message.sender_id,
        "sender_name": sender.name,

        "receiver_id": message.receiver_id,
        "receiver_name": receiver.name,

        "listing_id": message.listing_id,
        "listing_title": listing.title,

        "messages": message.messages
    }


def get_all_messages(
    db: Session,
    user_id: int
):
    Sender = aliased(User)
    Receiver = aliased(User)

    results = (
        db.query(
            Message,
            Sender,
            Receiver,
            Listing
        )
        .join(
            Sender,
            Message.sender_id == Sender.id
        )
        .join(
            Receiver,
            Message.receiver_id == Receiver.id
        )
        .join(
            Listing,
            Message.listing_id == Listing.id
        )
        .filter(
            (Message.sender_id == user_id) |
            (Message.receiver_id == user_id)
        )
        .order_by(Message.created_at)
        .all()
    )

    return [
        format_message(
            message,
            sender,
            receiver,
            listing
        )
        for message, sender, receiver, listing in results
    ]


def get_message_by_id(
    db: Session,
    message_id: int,
    user_id: int
):
    Sender = aliased(User)
    Receiver = aliased(User)

    result = (
        db.query(
            Message,
            Sender,
            Receiver,
            Listing
        )
        .join(
            Sender,
            Message.sender_id == Sender.id
        )
        .join(
            Receiver,
            Message.receiver_id == Receiver.id
        )
        .join(
            Listing,
            Message.listing_id == Listing.id
        )
        .filter(
            Message.id == message_id,
            (Message.sender_id == user_id) |
            (Message.receiver_id == user_id)
        )
        .first()
    )

    if not result:
        return None

    message, sender, receiver, listing = result

    return format_message(
        message,
        sender,
        receiver,
        listing
    )


def create_message(
    db: Session,
    message_data: MessageCreate,
    sender_id: int
):
    receiver = (
        db.query(User)
        .filter(
            User.id == message_data.receiver_id
        )
        .first()
    )

    if not receiver:
        return None

    listing = (
        db.query(Listing)
        .filter(
            Listing.id == message_data.listing_id
        )
        .first()
    )

    if not listing:
        return None

    message = Message(
        sender_id=sender_id,
        receiver_id=message_data.receiver_id,
        listing_id=message_data.listing_id,
        messages=message_data.messages
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    sender = (
        db.query(User)
        .filter(User.id == sender_id)
        .first()
    )

    return format_message(
        message,
        sender,
        receiver,
        listing
    )


def update_message(
    db: Session,
    message_id: int,
    message_data: MessageUpdate,
    sender_id: int
):
    message = (
        db.query(Message)
        .filter(
            Message.id == message_id,
            Message.sender_id == sender_id
        )
        .first()
    )

    if not message:
        return None

    message.messages = message_data.messages

    db.commit()
    db.refresh(message)

    return get_message_by_id(
        db,
        message_id,
        sender_id
    )


def delete_message(
    db: Session,
    message_id: int,
    sender_id: int
):
    message = (
        db.query(Message)
        .filter(
            Message.id == message_id,
            Message.sender_id == sender_id
        )
        .first()
    )

    if not message:
        return None

    db.delete(message)
    db.commit()

    return message