from core.database import DataBase
from database.repos import UserRepo
from security import JWTHandler
from typing import Annotated
from database.models import UserORM
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_user_from_access_token(
    session: DataBase,
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(security)] = None
) -> UserORM:

    if not creds:
        raise HTTPException(status_code=401, detail="Token Required!")
    
    token = creds.credentials

    payload = JWTHandler.decode_jwt(token=token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid Token!")
    
    user_db = await UserRepo(session=session).select_user_by_id(user_id=int(payload["sub"]))

    if not user_db:
        raise HTTPException(status_code=404, detail="User does not exist!")

    if not user_db.is_active:
        raise HTTPException(status_code=403, detail="Account Blocked!")

    return user_db