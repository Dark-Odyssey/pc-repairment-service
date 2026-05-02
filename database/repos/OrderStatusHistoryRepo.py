from datetime import datetime, date
from typing import Sequence
from sqlalchemy import select
from database.models import OrderStatusHistoryORM
from .BaseRepo import BaseRepo
from tools.types import StatusEnum

class OrderStatusHistoryRepo(BaseRepo):
    
    async def create_order_status_history(
    self,
    repair_order_id: int,
    changed_by_employee_id: int,
    old_status: StatusEnum | None = None,
    new_status: StatusEnum | None = None,
    old_estimated_completion_date: date | None = None,
    new_estimated_completion_date: date | None = None,
    ) -> OrderStatusHistoryORM:
        now = datetime.now()
        order_status_history_db = OrderStatusHistoryORM(
            repair_order_id=repair_order_id,
            old_status=old_status,
            new_status=new_status,
            old_estimated_completion_date=old_estimated_completion_date,
            new_estimated_completion_date=new_estimated_completion_date,
            changed_by_employee_id=changed_by_employee_id,
            changed_at=now
        )
        self.session.add(order_status_history_db)
        await self.session.flush()
        await self.session.refresh(order_status_history_db)
        return order_status_history_db
    
    async def select_by_status(self, status: StatusEnum, repair_order_id: int) -> OrderStatusHistoryORM | None:
        query = (
            select(OrderStatusHistoryORM)
            .where(OrderStatusHistoryORM.new_status == status)
            .where(OrderStatusHistoryORM.repair_order_id == repair_order_id)
        )
        result = await self.session.execute(query)
        return result.scalars().first()