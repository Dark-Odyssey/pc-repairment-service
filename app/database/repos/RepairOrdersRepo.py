from typing import Sequence
from datetime import datetime
from sqlalchemy import select, Select, func
from sqlalchemy.orm import joinedload, selectinload
from schemas import RepairOrdersCreateDTO, RepairOrdersFilterDTO, RepairOrderUpdateDTO, RepairOrdersPaginationDTO, RepairOrdersUserPaginationDTO
from database.models import RepairOrdersORM, UserORM, DeviceTypeORM
from tools.types import StatusEnum
from tools.pagination import count_pagination
from .BaseRepo import BaseRepo

class RepairOrdersRepo(BaseRepo):

    async def create_repair_order(
        self,
        schema: RepairOrdersCreateDTO,
        worker_id: int,
        access_code_hash: str
    ) -> RepairOrdersORM:
        now = datetime.now()
        repair_order_db = RepairOrdersORM(
            client_id=schema.client_id,
            device_type_id=schema.device_type_id,
            device_model=schema.device_model,
            issue_description=schema.issue_description,
            status=StatusEnum.CREATED,
            access_code_hash=access_code_hash,
            created_by_employee_id=worker_id,
            updated_by_employee_id=worker_id,
            created_at=now,
            updated_at=now
        )
        self.session.add(repair_order_db)
        await self.session.flush()
        await self.session.refresh(repair_order_db)
        return repair_order_db

    @staticmethod
    def _apply_filters(query: Select, filters: RepairOrdersFilterDTO) -> Select:
        if filters.client_id:
            query = query.where(RepairOrdersORM.client_id == filters.client_id)
        if filters.created_by_employee_id:
            query = query.where(RepairOrdersORM.created_by_employee_id == filters.created_by_employee_id)
        if filters.updated_by_employee_id:
            query = query.where(RepairOrdersORM.updated_by_employee_id == filters.updated_by_employee_id)
        if filters.status:
            query = query.where(RepairOrdersORM.status == filters.status)
        if filters.device_model:
            query = query.where(RepairOrdersORM.device_model == filters.device_model)
        if filters.device_type_id:
            query = query.where(RepairOrdersORM.device_type_id == filters.device_type_id)
        if filters.order_number:
            query = query.where(RepairOrdersORM.order_number == filters.order_number)
        if filters.client_first_name:
            query = query.where(UserORM.first_name.ilike(f"%{filters.client_first_name}%"))
        if filters.client_last_name:
            query = query.where(UserORM.last_name.ilike(f"%{filters.client_last_name}%"))
        if filters.device_type_name:
            query = query.where(DeviceTypeORM.device_type.ilike(f"%{filters.device_type_name}%"))
        return query

    async def select_repair_orders_filter(
       self,
       filters: RepairOrdersFilterDTO
    ) -> RepairOrdersPaginationDTO:
        query = select(RepairOrdersORM)
        query_count = select(func.count()).select_from(RepairOrdersORM)
        query = self._apply_filters(query=query, filters=filters)
        query_count = self._apply_filters(query=query_count, filters=filters)

        total = await self.session.execute(query_count)
        total = total.scalar()

        pagination = count_pagination(offset=filters.offset, limit=filters.limit, total=total)

        query = query.offset(filters.offset).limit(filters.limit).options(
            joinedload(RepairOrdersORM.client),
            joinedload(RepairOrdersORM.worker_created),
            joinedload(RepairOrdersORM.worker_updated),
            joinedload(RepairOrdersORM.device_type),\
            selectinload(RepairOrdersORM.history)
        )

        result = await self.session.execute(query)
        result = result.scalars().all()
        return RepairOrdersPaginationDTO(
            result=result,
            pagination=pagination
        )
    
    async def select_repair_order_by_id(self, id: int) -> RepairOrdersORM | None:
        query = select(RepairOrdersORM).where(RepairOrdersORM.id == id)
        result = await self.session.execute(query.options(
            joinedload(RepairOrdersORM.client),
            joinedload(RepairOrdersORM.worker_created),
            joinedload(RepairOrdersORM.worker_updated),
            joinedload(RepairOrdersORM.device_type),
            selectinload(RepairOrdersORM.history)
        ))
        return result.scalar_one_or_none()


    async def remove_repair_order(self, repair_order_db: RepairOrdersORM) -> None:
        await self.session.delete(repair_order_db)
        return
    
    async def update_repair_order(self, repair_order_db: RepairOrdersORM, schema: RepairOrderUpdateDTO, worker_id: int) -> RepairOrdersORM:
        now = datetime.now()
        schema_dict = schema.model_dump(exclude_none=True)
        for key, value in schema_dict.items():
            setattr(repair_order_db, key, value)
        repair_order_db.updated_by_employee_id = worker_id
        repair_order_db.updated_at = now
        await self.session.flush()
        await self.session.refresh(repair_order_db)
        return repair_order_db

    async def select_repair_orders_by_client_id(self, id: int, offset: int, limit: int) -> RepairOrdersUserPaginationDTO:
        query = select(RepairOrdersORM).where(RepairOrdersORM.client_id == id).options(
            joinedload(RepairOrdersORM.device_type),
            selectinload(RepairOrdersORM.history)
        ).offset(offset).limit(limit)
        query_count = select(func.count()).select_from(RepairOrdersORM).where(RepairOrdersORM.client_id == id)
        result = await self.session.execute(query)
        result = result.scalars().all()
        total = await self.session.execute(query_count)
        total = total.scalar()
        pagination = count_pagination(offset=offset, limit=limit, total=total)
        return RepairOrdersUserPaginationDTO(
            result=result, # type: ignore
            pagination=pagination
        )
