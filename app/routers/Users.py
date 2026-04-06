from database.core.database import DataBase
from schemas import UserDTO
from services import UserService
from fastapi import APIRouter, Depends
from schemas import UserFilterDTO

router = APIRouter()

@router.get("/users", response_model=list[UserDTO])
async def get_users(session: DataBase, filters: UserFilterDTO = Depends()):
    return await UserService(session=session).show_users(filters=filters)