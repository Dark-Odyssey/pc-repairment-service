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

class RepairOrderUpdateDTO(BaseModel):
    device_model: str | None = Field(default=None, max_length=100)
    issue_description: str | None = Field(default=None, max_length=256)
    estimated_completion_date: datetime | None = None
    status: StatusEnum | None = None
    service_note: str | None = Field(default=None, max_length=256)


# class RepairOrderUserShortDTO(BaseModel)