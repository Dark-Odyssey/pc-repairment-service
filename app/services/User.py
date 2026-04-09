from datetime import datetime, timedelta
from pydantic import EmailStr
from fastapi import HTTPException
from typing import Sequence
from hashlib import sha256
from secrets import token_hex
from database.models import UserORM
from core.config import settings
from schemas import UserFilterDTO, UserCreateAdminDTO, UserUpdate, UserLogin, Tokens, UserRegisterDTO, UserCreateWorkerDTO, UserCreateFullDTO, UpdatePasswordDTO
from security import Crypt, JWTHandler
from database.repos import UserRepo, PasswordResetRepo
from sqlalchemy.ext.asyncio import AsyncSession

class UserService:


    def __init__(self, session: AsyncSession) -> None:
        self.__userRepo = UserRepo(session=session)
        self.__passwordResetRepo = PasswordResetRepo(session=session)


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


    async def password_reset(self, user_email: EmailStr) -> str:
        user_db = await self.__userRepo.select_user_by_email(email=user_email)

        if not user_db:
            raise HTTPException(status_code=404, detail="User not found!")
        
        token = token_hex(32)

        hashed_token = sha256(token.encode()).hexdigest()
        
        await self.__passwordResetRepo.delete_all_previous_tokens(user_id=user_db.id)

        await self.__passwordResetRepo.insert_token(user_id=user_db.id, hashed_token=hashed_token)

        return token


    async def update_password(self, password: UpdatePasswordDTO, token: str) -> UserORM:

        if password.new_password != password.retry_password:
            raise HTTPException(status_code=400, detail="paswords dont match!")
        
        hashed_token = sha256(token.encode()).hexdigest()

        password_reset_db = await self.__passwordResetRepo.get_reset_by_token(hashed_token=hashed_token)
    
        if not password_reset_db:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_db = password_reset_db.user

        if not user_db:
            raise HTTPException(status_code=401, detail="Invalid token!")

        now = datetime.now()

        if now > password_reset_db.created_at + timedelta(seconds=settings.PASSWORD_RESET_TOKEN_LIFE):
            raise  HTTPException(status_code=401, detail="Token expired!")

        if user_db.updated_at == user_db.created_at:
            user_db.is_active = True
        
        user_db.updated_at = now
        user_db.password_hash = Crypt.hash_password(password.new_password)

        await self.__passwordResetRepo.delete_token_by_token_db(password_reset_db=password_reset_db)

        return user_db