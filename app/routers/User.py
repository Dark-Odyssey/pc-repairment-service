from database.core.database import DataBase
from schemas import UserDTO
from services import UserService
from fastapi import APIRouter, Depends
from schemas import UserFilterDTO, UserCreateDTO, UserUpdate


router = APIRouter()


@router.get("/users", response_model=list[UserDTO])
async def get_users(session: DataBase, filters: UserFilterDTO = Depends()):
    return await UserService(session=session).show_users(filters=filters)


@router.post("/users", response_model=UserDTO)
async def create_users(user: UserCreateDTO, session: DataBase):
    return await UserService(session=session).add_user(user)


@router.patch("/users/{user_id}", response_model=UserDTO)
async def put_user(user: UserUpdate, user_id: int, session: DataBase):
    return await UserService(session=session).patch_user(user_id=user_id, user_schema=user)