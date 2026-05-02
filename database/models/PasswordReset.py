from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import BaseORM
from .User import UserORM
from .annotations import intpk
from sqlalchemy import ForeignKey

class PasswordResetORM(BaseORM):
    __tablename__ = "password_reset"
    id: Mapped[intpk]
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    token: Mapped[str]
    created_at: Mapped[datetime]

    user: Mapped[UserORM] = relationship(UserORM)