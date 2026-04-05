from typing import Annotated
from datetime import datetime, date
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from database.core.database import BaseORM
from tools.types import RoleEnum, StatusEnum

intpk = Annotated[int, mapped_column(primary_key=True)]


class UserORM(BaseORM):
    __tablename__ = "user"
    id: Mapped[intpk]
    first_name: Mapped[str] = mapped_column(String(50))
    last_name: Mapped[str] = mapped_column(String(50))
    # login: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str]
    role: Mapped[RoleEnum]
    is_active: Mapped[bool]
    # must_change_password: Mapped[bool]
    reset_token_hash: Mapped[str]
    reset_token_expires_at: Mapped[datetime]
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]



class RepairOrdersORM(BaseORM):
    __tablename__ = "repair_orders"
    id: Mapped[intpk]
    order_number: Mapped[str] = mapped_column(String(50),unique=True)
    client_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    device_type: Mapped[str] = mapped_column(String(100))
    device_model: Mapped[str] = mapped_column(String(100))
    issue_description: Mapped[str] = mapped_column(String(256))
    accepted_at: Mapped[datetime]
    estimated_completion_date: Mapped[date]
    completed_at: Mapped[datetime]
    status: Mapped[StatusEnum]
    access_code_hash: Mapped[str]
    access_code_sent_at: Mapped[datetime]
    service_note: Mapped[str] = mapped_column(String(256))
    created_by_employee_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    updated_by_employee_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]

class OrderStatusHistory(BaseORM):
    __tablename__ = "order_status_history"
    id: Mapped[intpk]
    repair_order_id: Mapped[int] = mapped_column(ForeignKey("repair_orders.id", ondelete="SET NULL"))
    old_status: Mapped[StatusEnum]
    new_status: Mapped[StatusEnum]
    old_estimated_completion_date: Mapped[date]
    new_estimated_completion_date: Mapped[date]
    changed_by_employee_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    changed_by_employee_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="SET NULL"))
    changed_at: Mapped[datetime]