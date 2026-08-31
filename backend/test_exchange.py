from app.database.database import SessionLocal
from app.models import Exchange

db = SessionLocal()

exchange = db.query(Exchange).filter(Exchange.id == 1).first()

print("Status:", exchange.status)

print("Requester:", exchange.requester.name)
print("Receiver:", exchange.receiver.name)

print("Offered Item:", exchange.offered_listing.title)
print("Requested Item:", exchange.requested_listing.title)

db.close()