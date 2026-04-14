from typing import Annotated
from fastapi import APIRouter, Depends
from core.database import DataBase
from protect.roleChecker import access_all


router = APIRouter(prefix="/user", tags=["User"])

@router.get("/")
async def get_all_orders(session: DataBase, id: Annotated[int, Depends(access_all)]):
    pass