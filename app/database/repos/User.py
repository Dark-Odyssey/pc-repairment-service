from pydantic import BaseModel
from typing import Sequence
from datetime import datetime
from sqlalchemy import select, Select,  func
from sqlalchemy.orm import selectinload
from datetime import datetime
from tools.types import RoleEnum
from tools.pagination import count_pagination
from security.encryption import Crypt
from database.models import UserORM, RepairOrdersORM
from schemas import (UserCreateAdminDTO, UserFilterAdminDTO, UserAdminPaginationDTO, UserWorkerPaginationDTO,
                    UserUpdate, UserRegisterDTO, UserCreateWorkerDTO,
                    UserCreateFullDTO, UserFilterWorkerDTO)
from .BaseRepo import BaseRepo

class UserRepo(BaseRepo):


    async def _create_user(self, user_schema: BaseModel, **extra_data) -> UserORM:
        now = datetime.now()
        payload = user_schema.model_dump(exclude_unset=True)
        if payload.get("password"):
            payload["password_hash"] = Crypt.hash_password(payload["password"])
            payload.pop("password")
        user = UserORM(
            **payload,
            **extra_data,
            created_at = now,
            updated_at = now
        )
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user


    async def create_user_admin(self, user_schema: UserCreateAdminDTO) -> UserORM:
        return await self._create_user(
            user_schema=user_schema,
            is_active=False
        )


    async def create_user_worker(self, user_schema: UserCreateWorkerDTO) -> UserORM:
        return await self._create_user(
            user_schema=user_schema,
            is_active = False,
            role=RoleEnum.USER
        )


    async def create_user(self, user_schema: UserRegisterDTO) -> UserORM:
        return await self._create_user(
            user_schema=user_schema,
            is_active = True,
            role=RoleEnum.USER
        )


    async def create_user_full(self, user_schema: UserCreateFullDTO) -> UserORM:
        return await self._create_user(
            user_schema=user_schema
        )

    @staticmethod
    def _apply_filters(query: Select, filter_schema: UserFilterAdminDTO | UserFilterWorkerDTO) -> Select:
        if filter_schema.first_name:
            query = query.where(UserORM.first_name.ilike(f"%{filter_schema.first_name}%"))

        if filter_schema.last_name:
            query = query.where(UserORM.last_name.ilike(f"%{filter_schema.last_name}%"))

        if filter_schema.email:
            query = query.where(UserORM.email.ilike(f"%{filter_schema.email}%"))
        
        if getattr(filter_schema, "role", None):
            query = query.where(UserORM.role==filter_schema.role) # type: ignore

        if type(filter_schema) is UserFilterWorkerDTO:
            query = query.where(UserORM.role==RoleEnum.USER)

        if getattr(filter_schema, "is_active", None) is not None:
            query = query.where(UserORM.is_active==filter_schema.is_active) # type: ignore
        
        if filter_schema.phone_number is not None:
            query = query.where(UserORM.phone_number==filter_schema.phone_number)
        
        return query



    async def get_all_users(self, filter_schema: UserFilterAdminDTO | UserFilterWorkerDTO) -> UserWorkerPaginationDTO | UserAdminPaginationDTO:
        query = select(UserORM)
        query_count = select(func.count()).select_from(UserORM)

        query = self._apply_filters(query=query, filter_schema=filter_schema)
        query_count = self._apply_filters(query=query_count, filter_schema=filter_schema)

        total = await self.session.execute(query_count)
        total = total.scalar()

        pagination = count_pagination(offset=filter_schema.offset, limit=filter_schema.limit, total=total)

        result = await self.session.execute(query.offset(filter_schema.offset).limit(filter_schema.limit))
        result = result.scalars().all()

        if type(filter_schema) is UserFilterAdminDTO:
            return UserAdminPaginationDTO(
                result=result,
                pagination=pagination
            )
        else:
            return UserWorkerPaginationDTO(
                result=result,
                pagination=pagination
            )
        


    async def select_user_by_id(self, user_id: int) -> UserORM | None:
        query = (
            select(UserORM)
            .where(UserORM.id == user_id)
            )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()


    async def update_user(self, user_db: UserORM, user_schema: UserUpdate) -> UserORM:
        user_update_dict = user_schema.model_dump(exclude_none=True)
        for key, value in user_update_dict.items():
            setattr(user_db, key, value)
        user_db.updated_at = datetime.now()
        await self.session.flush()
        await self.session.refresh(user_db)
        return user_db


    async def remove_user(self, user_db: UserORM) -> None:
        await self.session.delete(user_db)
        return
    

    async def select_user_by_email(self, email: str) -> UserORM | None:
        query = (
            select(UserORM)
            .where(UserORM.email == email)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()


    async def select_user_by_phone_number(self, phone_number: str) -> UserORM | None:
        query = (
            select(UserORM)
            .where(UserORM.phone_number == phone_number)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def select_user_with_del_by_id(self, id: int) -> UserORM | None:
        query = (
            select(UserORM)
            .where(UserORM.id == id)
            .options(
                selectinload(UserORM.orders)
                .joinedload(RepairOrdersORM.worker_created),
                selectinload(UserORM.orders)
                .joinedload(RepairOrdersORM.worker_updated),
                selectinload(UserORM.orders)
                .joinedload(RepairOrdersORM.device_type)
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()