from typing import Sequence
from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload
from .BaseRepo import BaseRepo
from database.models import DeviceTypeORM, RepairOrdersORM
from schemas import DeviceTypeCreateDTO, DeviceTypeFilterDTO, DeviceTypeUpdateDTO

class DeviceTypeRepo(BaseRepo):
    
    async def create_device_type(self, device_type_schema: DeviceTypeCreateDTO) -> DeviceTypeORM:
        device_type_db = DeviceTypeORM(
            device_type=device_type_schema.device_type,
            description=device_type_schema.description,
        )
        self.session.add(device_type_db)
        await self.session.flush()
        await self.session.refresh(device_type_db)
        return device_type_db
    
    async def update_device_type(self, device_type_db: DeviceTypeORM, update_schema: DeviceTypeUpdateDTO) -> DeviceTypeORM:
        if update_schema.device_type:
            device_type_db.device_type = update_schema.device_type
        if update_schema.description:
            device_type_db.description = update_schema.description
        await self.session.flush()
        await self.session.refresh(device_type_db)
        return device_type_db
    

    async def select_device_type_by_id(self, id: int) -> DeviceTypeORM | None:
        query = (
            select(DeviceTypeORM)
            .where(DeviceTypeORM.id==id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()


    async def select_device_type(self, filters: DeviceTypeFilterDTO) -> Sequence[DeviceTypeORM]:
        query = (
            select(DeviceTypeORM)
        )
        if filters.device_type:
            query = query.where(DeviceTypeORM.device_type.ilike(f"%{filters.device_type}%"))
        result = await self.session.execute(query.offset(filters.offset).limit(filters.limit))
        return result.scalars().all()
    
    async def select_device_type_by_name(self, device_type_name: str) -> DeviceTypeORM | None:
        query = (
            select(DeviceTypeORM)
            .where(DeviceTypeORM.device_type==device_type_name)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
    
    async def remove_device_type_object(self, device_type_db: DeviceTypeORM) -> None:
        await self.session.delete(device_type_db)
        return


    async def get_device_type_by_id_rel(self, id: int) -> DeviceTypeORM | None:
        query = (
            select(DeviceTypeORM)
            .where(DeviceTypeORM.id == id)
            .options(
                selectinload(DeviceTypeORM.orders)
                .joinedload(RepairOrdersORM.client),
                selectinload(DeviceTypeORM.orders)
                .joinedload(RepairOrdersORM.worker_created),
                selectinload(DeviceTypeORM.orders)
                .joinedload(RepairOrdersORM.worker_updated)
            )
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()