from datetime import datetime
from typing import Annotated
from fastapi import Depends, HTTPException, Header, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.database import DataBase
from database.repos import UserRepo
from security import JWTHandler
from sqlalchemy.ext.asyncio import AsyncSession
from schemas import Tokens
from security import JWTHandler
from core.config import settings
from database.models import UserORM


security = HTTPBearer()


async def validate_token(token: str | None, token_type: str) -> dict:
    if not token:
        raise HTTPException(status_code=401, detail="Token Required!")
    
    payload = JWTHandler.decode_jwt(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token!")
    
    if payload.get("token_type") != token_type:
        raise HTTPException(status_code=401, detail="Invalid token!")

    return payload


async def validate_db_user(session: AsyncSession, user_id: int, created_at: int):
    user_db = await UserRepo(session=session).select_user_by_id(user_id=user_id)


    if not user_db:
        raise HTTPException(status_code=404, detail="User does not exist!")

    if int(user_db.updated_at.timestamp()) > created_at:
        raise HTTPException(status_code=401, detail="Invalid token!")

    if not user_db.is_active:
        raise HTTPException(status_code=403, detail="User Blocked!")
    
    return user_db


async def get_user_from_access_token(
    session: DataBase,
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)] = None
) -> UserORM:
    if not creds:
        raise HTTPException(status_code=401, detail="Token Required!")

    access_token = creds.credentials

    payload = await validate_token(token=access_token, token_type="access")

    user_id = payload.get("sub")
    created_at = payload.get("iat")

    if not user_id or not created_at:
        raise HTTPException(status_code=401, detail="Invalid Token!")

    return await validate_db_user(session=session, user_id=int(user_id), created_at=created_at)


async def refresh_tokens(
    session: DataBase,
    x_csrf_token: Annotated[str | None, Header(alias=settings.CSRF_HEADER_NAME)] = None,
    refresh_token: Annotated[str | None, Cookie(alias=settings.REFRESH_COOKIE_NAME)] = None,
) -> Tokens:
    payload = await validate_token(token=refresh_token, token_type="refresh")

    if payload.get("csrf") != x_csrf_token:
        raise HTTPException(status_code=401, detail="CSRF mismatch!")

    user_id = payload.get("sub")
    created_at = payload.get("iat")

    if not user_id or not created_at:
        raise HTTPException(status_code=401, detail="Invalid Token!")

    user_db = await validate_db_user(session=session, user_id=int(user_id), created_at=created_at)

    return await JWTHandler.generate_tokens(user_db=user_db)