from datetime import datetime, date
from .annotations import intpk
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey
from tools.types import StatusEnum
from core.database import BaseORM


class OrderStatusHistoryORM(BaseORM):
    __tablename__ = "order_status_history"
    id: Mapped[intpk]
    repair_order_id: Mapped[int] = mapped_column(ForeignKey("repair_orders.id", ondelete="SET NULL"))
    old_status: Mapped[StatusEnum]
    new_status: Mapped[StatusEnum]
    old_estimated_completion_date: Mapped[date]
    new_estimated_completion_date: Mapped[date]
    changed_by_employee_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    changed_at: Mapped[datetime]