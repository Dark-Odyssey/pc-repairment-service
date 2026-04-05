from datetime import datetime
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from database.core.database import BaseORM
from tools.types import RoleEnum
from .annotations import intpk, str_50

class UserORM(BaseORM):
    __tablename__ = "user"
    id: Mapped[intpk]
    first_name: Mapped[str_50]
    last_name: Mapped[str_50]
    email: Mapped[str] = mapped_column(String(50), unique=True)
    role: Mapped[RoleEnum]
    password_hash: Mapped[str]
    is_active: Mapped[bool]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
