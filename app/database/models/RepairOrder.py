from datetime import datetime, date
from core.database import BaseORM
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, ForeignKey
from .annotations import intpk, str_100, str_256
from tools.types import StatusEnum

class RepairOrdersORM(BaseORM):
    __tablename__ = "repair_orders"
    id: Mapped[intpk]
    order_number: Mapped[str] = mapped_column(String(50),unique=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    device_type: Mapped[str_100]
    device_model: Mapped[str_100]
    issue_description: Mapped[str_256]
    accepted_at: Mapped[datetime]
    estimated_completion_date: Mapped[date]
    completed_at: Mapped[datetime] = mapped_column(nullable=True)
    status: Mapped[StatusEnum]
    access_code_hash: Mapped[str]
    access_code_sent_at: Mapped[datetime]
    service_note: Mapped[str_256]
    created_by_employee_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    updated_by_employee_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
