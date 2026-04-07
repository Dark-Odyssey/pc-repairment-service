from fastapi.exceptions import HTTPException
from typing import Sequence
from database.repos import UserRepo
from database.models import UserORM
from schemas import UserFilterDTO, UserCreateDTO, UserDTO, UserUpdate
from sqlalchemy.ext.asyncio import AsyncSession

class UserService:

    def __init__(self, session: AsyncSession) -> None:
        self.__userRepo = UserRepo(session=session)
    
    async def show_users(self, filters: UserFilterDTO) -> Sequence[UserORM]:
        return await self.__userRepo.get_all_users(filters)
    
    async def add_user(self, user: UserCreateDTO) -> UserORM:
        return await self.__userRepo.create_user(user)
    
    async def patch_user(self, user_id, user_schema: UserUpdate) -> UserORM:
        user_db = await self.__userRepo.select_user_by_id(user_id=user_id)
        if not user_db:
            raise HTTPException(status_code=404, detail="User not found!")
        return await self.__userRepo.update_user(user_db=user_db, user_schema=user_schema)