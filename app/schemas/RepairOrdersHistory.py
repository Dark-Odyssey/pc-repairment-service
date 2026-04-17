from datetime import datetime
from pydantic import BaseModel, ConfigDict
from tools.types import StatusEnum



class RepairOrdersHistoryUserDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    old_status: StatusEnum | None
    new_status: StatusEnum | None
    old_estimated_completion_date: datetime | None
    new_estimated_completion_date: datetime | None
    changed_at: datetime | None


class RepairOrderHistoryFullDTO(RepairOrdersHistoryUserDTO):
    id: int
    repair_order_id: int
    changed_by_employee_id: int
