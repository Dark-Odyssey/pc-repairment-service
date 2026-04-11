from typing import Annotated
from pydantic import EmailStr
from fastapi import APIRouter, Depends
from schemas.User import UserOutputDTO
from core.config import settings
from core.database import DataBase
from protect.protect_route import refresh_tokens, get_user_from_refresh_token
from services import UserService
from fastapi.responses import Response
from schemas import UserLogin, Tokens, UserRegisterDTO, UpdatePasswordDTO


router = APIRouter(prefix="/auth", tags=["Authentification"])


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


@router.post("/refresh")
async def refresh(
    tokens: Annotated[Tokens, Depends(refresh_tokens)],
    response: Response
):
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


@router.post("/register", response_model=UserOutputDTO)
async def create_users(user: UserRegisterDTO, session: DataBase):
    return await UserService(session=session).register_new_user(user)


@router.post("/logout", dependencies=[Depends(get_user_from_refresh_token)])
async def logout(
    response: Response,
):
    response.delete_cookie(settings.REFRESH_COOKIE_NAME)
    response.delete_cookie(settings.CSRF_COOKIE_NAME)
    return {
        "msg": "Success!"
    }


@router.post("/password-reset", status_code=201)
async def reset_password(email: EmailStr, session: DataBase):
    await UserService(session=session).password_reset(user_email=email)
    return 


@router.post("/new-password", response_model=UserOutputDTO)
async def get_new_password(session: DataBase, token: str, passwords: UpdatePasswordDTO):
    return await UserService(session=session).update_password(password=passwords, token=token)