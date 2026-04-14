from typing import Annotated
from fastapi import APIRouter, Depends
from core.database import DataBase
from schemas import OrderCredsDTO, RepairOrderUserRelDTO
from services import RepairOrdersService
from protect.roleChecker import access_all


router = APIRouter(prefix="/user", tags=["User"])

@router.get("/single-order", response_model=RepairOrderUserRelDTO)
async def get_order_by_creds(
    session: DataBase,
    order_creds: OrderCredsDTO = Depends()
):
    return await RepairOrdersService(session=session).get_order_data_from_creds(order_creds=order_creds)