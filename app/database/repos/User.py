from typing import Sequence
from datetime import datetime
from sqlalchemy import select
from tools.types import RoleEnum
from security.encryption import Crypt
from database.models import UserORM
from schemas import UserCreateDTO, UserDTO, UserFilterDTO 
from .BaseRepo import BaseRepo

class UserRepo(BaseRepo):

    async def create_user(
        self,
        user: UserCreateDTO
    ) -> UserORM:
        now = datetime.now()
        user_db = UserORM(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            password_hash=await Crypt.hash_password(user.password),
            role=user.role,
            is_active=user.is_active,
            created_at=now,
            updated_at=now
        )

        self.session.add(user_db)
        await self.session.commit()
        await self.session.refresh(user_db)
        return user_db

    async def get_all_users(
        self,
        filter_schema: UserFilterDTO
    ) -> Sequence[UserORM]:
        query = (select(UserORM))

        filter_dict = filter_schema.model_dump(exclude_none=True, exclude={"limit", "offset"})
        for key, value in filter_dict.items():
            if not getattr(UserORM, key):
                continue
            query = query.where(
                getattr(UserORM, key) == value
            )
        result = await self.session.execute(query.limit(filter_schema.limit).offset(filter_schema.offset))
        result = result.scalars().all()
        return result