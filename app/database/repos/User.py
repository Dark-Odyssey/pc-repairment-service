from security.encryption import Crypt
from database.models import UserORM
from database.schemas.User import UserCreateDTO
from .BaseRepo import BaseRepo
from datetime import datetime

class UserRepo(BaseRepo):

    async def create_user(
        self,
        user: UserCreateDTO
    ) -> UserORM:
        now = datetime.now()
        user_db = UserORM(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            password_hash=await Crypt.hash_password(user.password),
            role=user.role,
            is_active=user.is_active,
            created_at=now,
            updated_at=now
        )

        self.session.add(user_db)
        await self.session.commit()
        await self.session.refresh(user_db)
        return user_db

