from core.config import settings
from core.database import DataBase
from services import UserService
from fastapi.responses import Response
from schemas import UserLogin
from fastapi import APIRouter



router = APIRouter(prefix="/auth")





@router.post("/login", status_code=200)
async def login(user: UserLogin, response: Response, session: DataBase):
    tokens = await UserService(session=session).login(user=user)
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=tokens.refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_LIFE
    )
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=tokens.csrf_token,
        httponly=False,
        secure=True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_LIFE
    )
    return {
        "token_type": "Bearer",
        "token": tokens.access_token
    }