from security.encryption import Crypt
from app.database.models.UserModel import UserORM
from app.database.schemas.UserSchema import UserDTO
from .BaseRepo import BaseRepo

class UserRepo(BaseRepo):

    async def create_user(
        self,
        user: UserDTO
    ) -> UserORM:
        user_db = UserORM(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            password_hash=Crypt.hash_password(user.password)
            role=user.role,
            is_active=user.is_active,
            reset
        )