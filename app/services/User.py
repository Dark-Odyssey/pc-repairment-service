from fastapi.exceptions import HTTPException
from typing import Sequence, Annotated
from secrets import token_hex
from database.models import UserORM
from core.config import settings
from schemas import UserFilterDTO, UserCreateDTO, UserDTO, UserUpdate, UserLogin, Tokens
from security import Crypt, JWTHandler
from database.repos import UserRepo
from sqlalchemy.ext.asyncio import AsyncSession

class UserService:

    def __init__(self, session: AsyncSession) -> None:
        self.__userRepo = UserRepo(session=session)
    
    async def show_users(self, filters: UserFilterDTO) -> Sequence[UserORM]:
        return await self.__userRepo.get_all_users(filters)
    
    async def add_user(self, user: UserCreateDTO) -> UserORM:
        user_with_same_email = await self.__userRepo.select_user_by_email(email=user.email)

        if user_with_same_email:
            raise HTTPException(status_code=400, detail="User with same email exists!")

        return await self.__userRepo.create_user(user)
    
    async def patch_user(self, user_id, user_schema: UserUpdate) -> UserORM:
        user_db = await self.__userRepo.select_user_by_id(user_id=user_id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found!")
        return await self.__userRepo.update_user(user_db=user_db, user_schema=user_schema)
    
    async def delete_user(self, user_id: int) -> None:
        user_db = await self.__userRepo.select_user_by_id(user_id=user_id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found!")
        await self.__userRepo.remove_user(user_db=user_db)
        return
    
    async def login(self, user: UserLogin) -> Tokens:
        user_db = await self.__userRepo.select_user_by_email(email=user.email)
        if not user_db:
            raise HTTPException(status_code=400, detail="Incorrect creds!")
        if not Crypt.check_password(user.password, user_db.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect creds!")
        
        csrf_token = token_hex(16)

        access_payload = {
            "sub": str(user_db.id),
            "token_type": "access",
        }
        refresh_payload = {
            "sub": str(user_db.id),
            "token_type": "refresh",
            "csrf": csrf_token
        }

        tokens = Tokens(
            access_token=JWTHandler.make_jwt(payload=access_payload, lifetime=settings.ACCESS_TOKEN_LIFE),
            refresh_token=JWTHandler.make_jwt(payload=refresh_payload, lifetime=settings.REFRESH_TOKEN_LIFE),
            csrf_token=csrf_token
        )
        return tokens
