from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from core.database import BaseORM
from .annotations import intpk
from sqlalchemy import ForeignKey

class PasswordResetsORM(BaseORM):
    __tablename__ = "password_reset"
    id: Mapped[intpk]
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    token: Mapped[str]
    created_at: Mapped[datetime]