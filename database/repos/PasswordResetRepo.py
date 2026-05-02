from datetime import datetime
from sqlalchemy import delete, select
from sqlalchemy.orm import joinedload
from database.models import PasswordResetORM, UserORM
from .BaseRepo import BaseRepo

class PasswordResetRepo(BaseRepo):

    async def delete_all_previous_tokens(self, user_id: int) -> None:
        query = (
            delete(PasswordResetORM)
            .where(PasswordResetORM.user_id==user_id)
        )
        await self.session.execute(query)


    async def insert_token(self, user_id: int, hashed_token: str) -> None:
        now = datetime.now()
        token_db = PasswordResetORM(
            user_id=user_id,
            token=hashed_token,
            created_at=now
        )
        self.session.add(token_db)
        await self.session.flush()
        return
    

    async def get_reset_by_token(self, hashed_token: str) -> PasswordResetORM | None:
        query = (
            select(PasswordResetORM)
            .where(PasswordResetORM.token==hashed_token)
            .options(joinedload(PasswordResetORM.user))
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()


    async def delete_token_by_token_db(self, password_reset_db: PasswordResetORM) -> None:
        await self.session.delete(password_reset_db)
        return