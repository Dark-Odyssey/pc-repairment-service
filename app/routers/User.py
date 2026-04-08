from core.database import DataBase
from schemas import UserDTO
from services import UserService
from fastapi import APIRouter, Depends
from schemas import UserFilterDTO, UserCreateDTO, UserUpdate
from protect.roleChecker import access_admins, access_admins_workers, access_all


router = APIRouter()


@router.get("/users", response_model=list[UserDTO], dependencies=[Depends(access_admins)])
async def get_users(session: DataBase, filters: UserFilterDTO = Depends()):
    return await UserService(session=session).show_users(filters=filters)


@router.post("/users", response_model=UserDTO, dependencies=[Depends(access_admins_workers)])
async def create_users(user: UserCreateDTO, session: DataBase):
    return await UserService(session=session).add_user(user)


@router.patch("/users/{user_id}", response_model=UserDTO, dependencies=[Depends(access_admins)])
async def put_user(user: UserUpdate, user_id: int, session: DataBase):
    return await UserService(session=session).patch_user(user_id=user_id, user_schema=user)


@router.delete("/users/{user_id}", status_code=204, dependencies=[Depends(access_admins)])
async def delete_user(user_id: int, session: DataBase) -> None:
    return await UserService(session=session).delete_user(user_id=user_id)
