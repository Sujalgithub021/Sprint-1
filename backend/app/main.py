from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.user import router as user_router
from app.routers.listing import router as listing_router
from app.routers.favorite import router as favorite_router
from app.routers.listing_image import router as listing_image_router
from app.routers.exchange import router as exchange_router
from app.routers.deal import router as deal_router
from app.routers.review import router as review_router
from app.routers.message import router as message_router
from app.routers.auth import router as auth_router
from app.routers.category import router as category_router


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router)
app.include_router(listing_router)
app.include_router(favorite_router)
app.include_router(listing_image_router)
app.include_router(exchange_router)
app.include_router(deal_router)
app.include_router(review_router)
app.include_router(message_router)
app.include_router(auth_router)
app.include_router(category_router)