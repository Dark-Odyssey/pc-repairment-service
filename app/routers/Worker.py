from services import UserService
from schemas import UserCreateWorkerDTO
from core.database import DataBase
from fastapi import APIRouter, Depends
from protect.roleChecker import access_admins_workers


router = APIRouter(prefix="/worker", tags=["Workers"])


@router.post("/users", dependencies=[Depends(access_admins_workers)])
async def create_user(user: UserCreateWorkerDTO, session: DataBase):
    return await UserService(session=session).register_user(user)