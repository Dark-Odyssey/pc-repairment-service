from typing import Sequence
from datetime import datetime
from sqlalchemy import select
from tools.types import RoleEnum
from security.encryption import Crypt
from database.models import UserORM
from schemas import UserCreateDTO, UserDTO, UserFilterDTO , UserUpdate
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
            password_hash=Crypt.hash_password(user.password),
            role=user.role,
            is_active=user.is_active,
            created_at=now,
            updated_at=now
        )

        self.session.add(user_db)
        await self.session.commit()
        await self.session.refresh(user_db)
        return user_db

    async def get_all_users(self,filter_schema: UserFilterDTO) -> Sequence[UserORM]:
        query = (select(UserORM))

        if filter_schema.first_name:
            query = query.where(UserORM.first_name.ilike(f"%{filter_schema.first_name}%"))

        if filter_schema.last_name:
            query = query.where(UserORM.last_name.ilike(f"%{filter_schema.last_name}%"))

        if filter_schema.email:
            query = query.where(UserORM.email.ilike(f"%{filter_schema.email}%"))
        
        if filter_schema.role:
            query = query.where(UserORM.role==filter_schema.role)
        
        if filter_schema.is_active is not None:
            query = query.where(UserORM.is_active==filter_schema.is_active)

        result = await self.session.execute(query.limit(filter_schema.limit).offset(filter_schema.offset))
        result = result.scalars().all()
        return result


    async def select_user_by_id(self, user_id: int) -> UserORM | None:
        query = (
            select(UserORM)
            .where(UserORM.id == user_id)
            )
        result = await self.session.execute(query)
        return result.scalars().first()


    async def update_user(self, user_db: UserORM, user_schema: UserUpdate) -> UserORM:
        user_update_dict = user_schema.model_dump(exclude_none=True)
        for key, value in user_update_dict.items():
            setattr(user_db, key, value)
        await self.session.commit()
        await self.session.refresh(user_db)
        return user_db
