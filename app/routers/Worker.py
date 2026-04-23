from services import UserService
from schemas import UserCreateWorkerDTO, UserFilterWorkerDTO, UserOrderRelDTO, UserWorkerPaginationDTO, UserOutputWorkerDTO
from core.database import DataBase
from fastapi import APIRouter, Depends, BackgroundTasks
from protect.roleChecker import access_admins_workers


router = APIRouter(prefix="/worker", tags=["Workers"])


@router.post("/users", dependencies=[Depends(access_admins_workers)])
async def create_user(user: UserCreateWorkerDTO, session: DataBase, bg_tasks: BackgroundTasks):
    return await UserService(session=session).register_new_user(user, bg_tasks=bg_tasks)


@router.get("/users", dependencies=[Depends(access_admins_workers)], response_model=UserWorkerPaginationDTO)
async def get_users(
    session: DataBase,
    filter_schema: UserFilterWorkerDTO = Depends()
):
    return await UserService(session=session).show_users(filters=filter_schema)


@router.get("/users/{id}", dependencies=[Depends(access_admins_workers)], response_model=UserOutputWorkerDTO)
async def get_user_by_id(session: DataBase, id: int):
    return await UserService(session=session).get_user(id)