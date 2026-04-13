from datetime import datetime
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from core.database import BaseORM
from tools.types import RoleEnum
from .annotations import intpk, str_50

class UserORM(BaseORM):
    __tablename__ = "users"
    id: Mapped[intpk]
    first_name: Mapped[str_50]
    phone_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    last_name: Mapped[str_50]
    email: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    role: Mapped[RoleEnum]
    password_hash: Mapped[str] = mapped_column(nullable=True)
    is_active: Mapped[bool]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
