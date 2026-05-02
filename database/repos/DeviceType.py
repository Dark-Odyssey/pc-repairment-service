from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from .BaseRepo import BaseRepo
from tools.pagination import count_pagination
from database.models import DeviceTypeORM, RepairOrdersORM
from schemas import DeviceTypeCreateDTO, DeviceTypeFilterDTO, DeviceTypeUpdateDTO, DeviceTypePaginationDTO

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


    async def select_device_type(self, filters: DeviceTypeFilterDTO) -> DeviceTypePaginationDTO:
        query = (
            select(DeviceTypeORM)
        )
        query_count = (
            select(func.count()).select_from(DeviceTypeORM)
        )
        if filters.device_type:
            query = query.where(DeviceTypeORM.device_type.ilike(f"%{filters.device_type}%"))
            query_count = query.where(DeviceTypeORM.device_type.ilike(f"%{filters.device_type}%"))

        total = await self.session.execute(query_count)
        total = total.scalar()

        pagination = count_pagination(offset=filters.offset, limit=filters.limit, total=total)

        result = await self.session.execute(query.offset(filters.offset).limit(filters.limit))
        result = result.scalars().all()

        return DeviceTypePaginationDTO(
            result=result, # type: ignore
            pagination=pagination
        )
    
    async def select_device_type_by_name(self, device_type_name: str) -> DeviceTypeORM | None:
        query = (
            select(DeviceTypeORM)
            .where(DeviceTypeORM.device_type==device_type_name)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
    
    async def remove_device_type_object(self, device_type_db: DeviceTypeORM) -> None:
        await self.session.delete(device_type_db)
        await self.session.commit()
        return
