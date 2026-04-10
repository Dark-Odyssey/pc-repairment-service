from typing import Annotated



from fastapi import APIRouter, Depends
from core.database import DataBase
from services import UserService
from database.models import UserORM
from schemas import UserFilterDTO, UserCreateAdminDTO, UserUpdate, UserOutputDTO
from protect.roleChecker import access_admins


router = APIRouter(prefix="/admin")


@router.get("/users", response_model=list[UserOutputDTO], dependencies=[Depends(access_admins)])
async def get_users(session: DataBase, filters: UserFilterDTO = Depends()):
    return await UserService(session=session).show_users(filters=filters)


@router.patch("/users/{user_id}", response_model=UserOutputDTO, dependencies=[Depends(access_admins)])
async def put_user(user: UserUpdate, user_id: int, session: DataBase):
    return await UserService(session=session).patch_user(user_id=user_id, user_schema=user)


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, session: DataBase, user_who_asked: Annotated[UserORM, Depends(access_admins)]) -> None:
    return await UserService(session=session).delete_user(user_id=user_id, used_who_asked_id=user_who_asked.id)


@router.post("/users", response_model=UserOutputDTO, dependencies=[Depends(access_admins)])
async def create_user(user: UserCreateAdminDTO, session: DataBase):
    return await UserService(session=session).register_user_admin(user)