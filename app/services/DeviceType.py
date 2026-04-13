from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from database.models import DeviceTypeORM
from database.repos import DeviceTypeRepo
from schemas import DeviceTypeCreateDTO, DeviceTypeUpdateDTO, DeviceTypeFilterDTO, DeviceTypeDTO

class DeviceTypeService:

    def __init__(self, session: AsyncSession) -> None:
        self.__deviceTypeRepo = DeviceTypeRepo(session=session)


    async def create_device_type(self, device_type: DeviceTypeCreateDTO) -> DeviceTypeORM:
        device_type_with_same_name = await self.__deviceTypeRepo.select_device_type_by_name(device_type.device_type)
    
        if device_type_with_same_name:
            raise HTTPException(status_code=400, detail="Device type with same name already exists!")

        return await self.__deviceTypeRepo.create_device_type(device_type_schema=device_type)

    async def get_all_types(self, filters: DeviceTypeFilterDTO) -> Sequence[DeviceTypeORM]:
        return await self.__deviceTypeRepo.select_device_type(filters=filters)
    

    async def delete_device_type(self, id: int) -> None:
        device_type_db = await self.__deviceTypeRepo.select_device_type_by_id(id)
        if not device_type_db:
            raise HTTPException(status_code=404, detail="Device type doesn't exist!")
        await self.__deviceTypeRepo.remove_device_type_object(device_type_db)
        return
    

    async def update_device_type(self, id: int, update_schema: DeviceTypeUpdateDTO) -> DeviceTypeORM:
        device_type_db = await self.__deviceTypeRepo.select_device_type_by_id(id)
        if not device_type_db:
            raise HTTPException(status_code=404, detail="Device type doesn't exist")
        if update_schema.device_type:
            device_type_with_same_name = await self.__deviceTypeRepo.select_device_type_by_name(update_schema.device_type)
            if device_type_with_same_name and device_type_with_same_name.id != device_type_db.id:
                raise HTTPException(status_code=400, detail="Device Type with same name already exists!")

        if not device_type_db:
            raise HTTPException(status_code=404, detail="Device type not found!")
        
        return await self.__deviceTypeRepo.update_device_type(device_type_db, update_schema)
    
    async def get_device_type_by_id_rel(self, id: int) -> DeviceTypeORM:
        device_type_db = await self.__deviceTypeRepo.get_device_type_by_id_rel(id)
        if not device_type_db:
            raise HTTPException(status_code=404, detail="Device type doesn't exist!")
        return device_type_db