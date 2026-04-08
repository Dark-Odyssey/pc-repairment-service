from typing import Annotated
from fastapi import Depends, HTTPException
from tools.types import RoleEnum
from database.models import UserORM
from .protect_route import get_user_from_access_token

class RoleChecker():
    def __init__(self, allowed_roles: list[RoleEnum]) -> None:
        self.allowed_roles = allowed_roles

    async def __call__(self, user_db: Annotated[UserORM, Depends(get_user_from_access_token)]):
        if user_db.role not in self.allowed_roles:
            print(self.allowed_roles)
            print(user_db.role)
            raise HTTPException(status_code=403, detail="Access Forbidden")
        return
        
access_admins = RoleChecker([RoleEnum.ADMIN])
access_admins_workers = RoleChecker([RoleEnum.ADMIN, RoleEnum.WORKER])
access_all = RoleChecker([RoleEnum.ADMIN, RoleEnum.WORKER, RoleEnum.USER])
