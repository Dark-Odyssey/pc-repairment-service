from datetime import datetime
from schemas import RepairOrdersCreateDTO
from database.models import RepairOrdersORM
from tools.types import StatusEnum
from .BaseRepo import BaseRepo

class RepairOrdersRepo(BaseRepo):

    async def create_repair_order(self, schema: RepairOrdersCreateDTO, worker_id: int, access_code_hash: str) -> RepairOrdersORM:
        now = datetime.now()
        repair_order_db = RepairOrdersORM(
            client_id=schema.client_id,
            device_type_id=schema.device_type_id,
            device_model=schema.device_model,
            issue_description=schema.issue_description,
            status=StatusEnum.CREATED,
            access_code_hash=access_code_hash,
            created_by_employee_id=worker_id,
            updated_by_employee_id=worker_id,
            created_at=now,
            updated_at=now
        )
        self.session.add(repair_order_db)
        await self.session.flush()
        await self.session.refresh(repair_order_db)
        return repair_order_db