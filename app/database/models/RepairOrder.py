from datetime import datetime, date
from database.models.User import UserORM
from database.models.DeviceType import DeviceTypeORM
from database.models.OrderStatusHistory import OrderStatusHistoryORM
from core.database import BaseORM
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey
from .annotations import intpk, str_100, str_256
from tools.types import StatusEnum

class RepairOrdersORM(BaseORM):
    __tablename__ = "repair_orders"
    id: Mapped[intpk]
    order_number: Mapped[str] = mapped_column(String(50),unique=True, nullable=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    device_type_id: Mapped[int] = mapped_column(ForeignKey("device_type.id", ondelete="SET NULL"))
    device_model: Mapped[str_100]
    issue_description: Mapped[str_256]
    estimated_completion_date: Mapped[date] = mapped_column(nullable=True)
    status: Mapped[StatusEnum]
    access_code_hash: Mapped[str]
    service_note: Mapped[str_256] = mapped_column(nullable=True)
    price: Mapped[int] = mapped_column(nullable=True)
    created_by_employee_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    updated_by_employee_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]

    client: Mapped["UserORM"] = relationship(
        "UserORM",
    foreign_keys="[RepairOrdersORM.client_id]",
        back_populates="orders"
    )
    worker_created: Mapped["UserORM"] = relationship(
        "UserORM",
        foreign_keys="[RepairOrdersORM.created_by_employee_id]"
    )
    worker_updated: Mapped["UserORM"] = relationship(
        "UserORM",
        foreign_keys="[RepairOrdersORM.updated_by_employee_id]"
    )
    device_type: Mapped["DeviceTypeORM"] = relationship(
        "DeviceTypeORM",
        foreign_keys="[RepairOrdersORM.device_type_id]",
    )
    history: Mapped[list["OrderStatusHistoryORM"]] = relationship(
        "OrderStatusHistoryORM",
        foreign_keys="[OrderStatusHistoryORM.repair_order_id]",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
