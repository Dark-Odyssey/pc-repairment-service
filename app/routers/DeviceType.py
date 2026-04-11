from fastapi import APIRouter, Depends
from protect.roleChecker import access_admins_workers
from core.database import DataBase
from services import DeviceTypeService
from schemas import DeviceTypeCreateDTO, DeviceTypeDTO, DeviceTypeSeachDTO, DeviceTypeUpdateDTO

router = APIRouter(tags=["Device Type"])


@router.post("/device-type", response_model=DeviceTypeDTO, dependencies=[Depends(access_admins_workers)])
async def create_device_type(device_type: DeviceTypeCreateDTO, session: DataBase):
    return await DeviceTypeService(session=session).create_device_type(device_type=device_type)


@router.get("/device-type", response_model=list[DeviceTypeDTO], dependencies=[Depends(access_admins_workers)])
async def get_device_type(session: DataBase, filters: DeviceTypeSeachDTO = Depends()):
    return await DeviceTypeService(session=session).get_all_types(filters=filters)


@router.delete("/device-type/{id}", status_code=204, dependencies=[Depends(access_admins_workers)])
async def delete_device_type(session: DataBase, id: int):
    await DeviceTypeService(session=session).delete_device_type(id)

@router.patch("/device-type/{id}", response_model=DeviceTypeDTO, dependencies=[Depends(access_admins_workers)])
async def patch_device_type(session: DataBase, id: int, update_schema: DeviceTypeUpdateDTO):
    return await DeviceTypeService(session=session).update_device_type(id, update_schema)
