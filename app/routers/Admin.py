from typing import Annotated
from fastapi import APIRouter, Depends
from core.database import DataBase
from services import UserService
from schemas import UserFilterAdminDTO, UserCreateAdminDTO, UserUpdate, UserFullOutput, UserOrderFullRelDTO, UserAdminPaginationDTO
from protect.roleChecker import access_admins


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=UserAdminPaginationDTO, dependencies=[Depends(access_admins)])
async def get_users(session: DataBase, filters: UserFilterAdminDTO = Depends()):
    return await UserService(session=session).show_users(filters=filters)


@router.patch("/users/{user_id}", response_model=UserFullOutput, dependencies=[Depends(access_admins)])
async def put_user(user: UserUpdate, user_id: int, session: DataBase):
    return await UserService(session=session).patch_user(user_id=user_id, user_schema=user)


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, session: DataBase, user_who_asked_id: Annotated[int, Depends(access_admins)]) -> None:
    return await UserService(session=session).delete_user(user_id=user_id, used_who_asked_id=user_who_asked_id)


@router.post("/users", response_model=UserFullOutput, dependencies=[Depends(access_admins)])
async def create_user(user: UserCreateAdminDTO, session: DataBase):
    return await UserService(session=session).register_new_user(user)


@router.get("/users/{id}", response_model=UserOrderFullRelDTO, dependencies=[Depends(access_admins)])
async def get_single_user(session: DataBase, id: int):
    return await UserService(session=session).get_user_by_id_rel(id)