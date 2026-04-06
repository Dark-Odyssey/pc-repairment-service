from typing import Sequence
from database.repos import UserRepo
from database.models import UserORM
from schemas import UserFilterDTO
from sqlalchemy.ext.asyncio import AsyncSession

class UserService:

    def __init__(self, session: AsyncSession) -> None:
        self.__userRepo = UserRepo(session=session)
    
    async def show_users(self, filters: UserFilterDTO) -> Sequence[UserORM]:
        return await self.__userRepo.get_all_users(filters)