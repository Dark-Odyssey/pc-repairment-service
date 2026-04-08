from fastapi import HTTPException
from typing import Sequence, Annotated
from secrets import token_hex
from database.models import UserORM
from core.config import settings
from schemas import UserFilterDTO, UserCreateAdminDTO, UserUpdate, UserLogin, Tokens, UserRegisterDTO, UserCreateWorkerDTO, UserCreateFullDTO
from security import Crypt, JWTHandler
from database.repos import UserRepo
from sqlalchemy.ext.asyncio import AsyncSession

class UserService:


    def __init__(self, session: AsyncSession) -> None:
        self.__userRepo = UserRepo(session=session)

    async def validate_before_creation(self, user: UserRegisterDTO | UserCreateWorkerDTO | UserCreateAdminDTO | UserCreateFullDTO) -> bool:
        user_with_same_email = await self.__userRepo.select_user_by_email(email=user.email)

        if user_with_same_email:
            raise HTTPException(status_code=400, detail="User with same email exists!")
        
        user_with_same_phone = await self.__userRepo.select_user_by_phone_number(phone_number=user.phone_number)

        if user_with_same_phone:
            raise HTTPException(status_code=400, detail="Number Registered!")
        
        return True


    async def show_users(self, filters: UserFilterDTO) -> Sequence[UserORM]:
        return await self.__userRepo.get_all_users(filters)


    async def register_user(self, user: UserRegisterDTO) -> UserORM:
        await self.validate_before_creation(user)
        return await self.__userRepo.create_user(user)

    async def register_user_worker(self, user: UserCreateWorkerDTO, ) -> UserORM:
        await self.validate_before_creation(user)
        return await self.__userRepo.create_user_worker(user)

    async def register_user_admin(self, user: UserCreateAdminDTO, ) -> UserORM:
        await self.validate_before_creation(user)
        return await self.__userRepo.create_user_admin(user)


    async def patch_user(self, user_id, user_schema: UserUpdate) -> UserORM:
        user_db = await self.__userRepo.select_user_by_id(user_id=user_id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found!")
        return await self.__userRepo.update_user(user_db=user_db, user_schema=user_schema)


    async def delete_user(self, user_id: int, used_who_asked_id: int) -> None:
        if user_id == used_who_asked_id:
            raise HTTPException(status_code=403, detail="Cant delete yourself!")
        user_db = await self.__userRepo.select_user_by_id(user_id=user_id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found!")
        await self.__userRepo.remove_user(user_db=user_db)
        return


    async def login(self, user: UserLogin) -> Tokens:
        user_db = await self.__userRepo.select_user_by_email(email=user.email)

        if not user_db or not user_db.password_hash:
            raise HTTPException(status_code=400, detail="Incorrect creds!")

        if not Crypt.check_password(user.password, user_db.password_hash):
            raise HTTPException(status_code=400, detail="Incorrect creds!")

        return await JWTHandler.generate_tokens(user_db=user_db)
