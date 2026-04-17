from typing import Annotated
from fastapi import APIRouter, Depends
from schemas.User import UserOutputDTO
from core.database import DataBase
from schemas import OrderCredsDTO, RepairOrderUserRelDTO, RepairOrdersUserPaginationDTO
from services import RepairOrdersService, UserService
from protect.roleChecker import access_all


router = APIRouter(prefix="/user", tags=["User"])

@router.get("/single-order", response_model=RepairOrderUserRelDTO)
async def get_order_by_creds(
    session: DataBase,
    order_creds: OrderCredsDTO = Depends()
):
    return await RepairOrdersService(session=session).get_order_data_from_creds(order_creds=order_creds)

@router.get("/", response_model=UserOutputDTO)
async def get_user_data(session: DataBase, id: Annotated[int, Depends(access_all)]):
    return await UserService(session=session).get_user(id=id)




@router.get("/orders", response_model=RepairOrdersUserPaginationDTO)
async def get_user_orders(
    session: DataBase,
    id: Annotated[int, Depends(access_all)],
    offset: int = 0,
    limit: int = 10
):
    return await RepairOrdersService(session=session).get_user_repair_orders(id=id, offset=offset, limit=limit)