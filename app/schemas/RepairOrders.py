from tools.types import StatusEnum
from datetime import datetime
from pydantic import BaseModel, Field


class RepairOrdersCreateDTO(BaseModel):
    client_id: int
    device_type_id: int
    device_model: str = Field(max_length=100)
    issue_description: str = Field(max_length=256)

class RepairOrdersCreateServiceDTO(RepairOrdersCreateDTO):
    order_number: str
    


class RepairOrdersDTO(RepairOrdersCreateDTO):
    id: int
    order_number: str
    estimated_completion_date: datetime | None
    status: StatusEnum
    created_by_employee_id: int
    updated_by_employee_id: int
    created_at: datetime
    updated_at: datetime


class RepairOrdersFilterDTO(BaseModel):
    id: int | None = None
    order_number: str | None = None
    status: StatusEnum | None = None
    client_id: int | None = None
    device_type_id: int | None = None
    device_model: str | None = None
    created_by_employee_id: int | None = None
    updated_by_employee_id: int | None = None
    client_first_name: str | None = None
    client_last_name: str | None = None
    device_type_name: str | None = None
    offset: int = 0
    limit: int = 30