from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.home import router as home_router
from app.routes.cases import router as cases_router
from app.routes.news_scraper import router as news_scraper_router
from app.routes.notification import router as notification_router
from app.routes.chat import router as chat_router

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, tags=["Authentication"])
app.include_router(users_router, prefix="/users", tags=["User Management"])
app.include_router(cases_router, prefix="/cases", tags=["Case Management"])
app.include_router(home_router, tags=["Home Page"])
app.include_router(news_scraper_router, tags=["News"])
app.include_router(notification_router, tags=["Notifications"])
app.include_router(chat_router, tags=["Chat"])
@app.get("/")
def read_root():
    return {"message": "Welcome to the Legal Aid Platform"}