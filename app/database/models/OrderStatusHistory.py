from datetime import datetime, date
from .annotations import intpk
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey
from tools.types import StatusEnum
from core.database import BaseORM


class OrderStatusHistoryORM(BaseORM):
    __tablename__ = "order_status_history"
    id: Mapped[intpk]
    repair_order_id: Mapped[int] = mapped_column(ForeignKey("repair_orders.id", ondelete="CASCADE"))
    old_status: Mapped[StatusEnum] = mapped_column(nullable=True)
    new_status: Mapped[StatusEnum] = mapped_column(nullable=True)
    old_estimated_completion_date: Mapped[date] = mapped_column(nullable=True)
    new_estimated_completion_date: Mapped[date] = mapped_column(nullable=True)
    changed_by_employee_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    changed_at: Mapped[datetime]