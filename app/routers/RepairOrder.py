from typing import Annotated
from fastapi import APIRouter, Depends
from services import RepairOrdersService
from core.database import DataBase
from schemas import RepairOrdersCreateDTO
from protect.roleChecker import access_admins_workers

router = APIRouter(prefix="/repair-order", tags=["RepairOrders"])

@router.post("/")
async def create_repair_order(
    session: DataBase,
    worker_id: Annotated[int, Depends(access_admins_workers)],
    schema: RepairOrdersCreateDTO
):
    return await RepairOrdersService(session=session).create_order(worker_id=worker_id, schema=schema)