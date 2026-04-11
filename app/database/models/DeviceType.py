from .annotations import intpk, str_50, str_256
from core.database import BaseORM
from sqlalchemy.orm import Mapped, mapped_column


class DeviceTypeORM(BaseORM):
    __tablename__ = "device_type"
    id: Mapped[intpk]
    device_type: Mapped[str_50] = mapped_column(unique=True)
    description: Mapped[str_256] = mapped_column(nullable=True)