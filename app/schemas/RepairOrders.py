from tools.types import StatusEnum
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict


class RepairOrdersCreateDTO(BaseModel):
    client_id: int
    device_type_id: int
    device_model: str = Field(max_length=100)
    issue_description: str = Field(max_length=256)
    price: int | None = None

class RepairOrdersCreateServiceDTO(RepairOrdersCreateDTO):
    order_number: str
    

class RepairOrdersDTO(RepairOrdersCreateDTO):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_number: str
    estimated_completion_date: datetime | None
    service_note: str | None
    status: StatusEnum
    created_by_employee_id: int
    updated_by_employee_id: int
    created_at: datetime
    updated_at: datetime

class RepairOrderUpdateDTO(BaseModel):
    device_model: str | None = Field(default=None, max_length=100)
    issue_description: str | None = Field(default=None, max_length=256)
    price: int | None = None
    estimated_completion_date: date | None = None
    status: StatusEnum | None = None
    service_note: str | None = Field(default=None, max_length=256)


class RepairOrderUserDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    order_number: str
    estimated_completion_date: datetime | None
    status: StatusEnum
    created_at: datetime
    device_model: str
    issue_description: str
    price: int | None = None
