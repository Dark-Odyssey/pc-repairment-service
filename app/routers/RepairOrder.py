from typing import Annotated
from fastapi import APIRouter, Depends
from services import RepairOrdersService
from core.database import DataBase
from schemas import RepairOrdersCreateDTO, RepairOrdersFilterDTO, RepairOrdersRelDTO, RepairOrderUpdateDTO
from protect.roleChecker import access_admins_workers, access_admins

router = APIRouter(prefix="/repair-order", tags=["Repair Orders"])

@router.post("/")
async def create_repair_order(
    session: DataBase,
    worker_id: Annotated[int, Depends(access_admins_workers)],
    schema: RepairOrdersCreateDTO
):
    return await RepairOrdersService(session=session).create_order(worker_id=worker_id, schema=schema)


@router.get("/", dependencies=[Depends(access_admins_workers)], response_model=list[RepairOrdersRelDTO])
async def get_orders(
    session: DataBase,
    filters: RepairOrdersFilterDTO = Depends()
):
    return await RepairOrdersService(session=session).select_repair_orders_filter(filters=filters)

@router.get("/{id}", dependencies=[Depends(access_admins_workers)], response_model=RepairOrdersRelDTO)
async def get_single_repair_order(session: DataBase, id: int):
    return await RepairOrdersService(session=session).get_by_repair_order_by_id(id=id)

@router.delete("/{id}", dependencies=[Depends(access_admins)], status_code=204)
async def delete_order(session: DataBase, id: int):
    return await RepairOrdersService(session=session).remove_order(id)


@router.patch("/{id}", response_model=RepairOrdersRelDTO)
async def patch_orders(
    session: DataBase,
    id: int,
    schema: RepairOrderUpdateDTO,
    worker_id: Annotated[int, Depends(access_admins_workers)]
):
    return await RepairOrdersService(session=session).update_order(id=id, worker_id=worker_id, schema=schema)