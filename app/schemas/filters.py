from pydantic import BaseModel, Field
from tools.types import RoleEnum, StatusEnum


class UserFilterWorkerDTO(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    offset: int = Field(default=0)
    limit: int = Field(default=30)


class UserFilterDTO(UserFilterWorkerDTO):
    role: RoleEnum | None = None
    is_active: bool | None = None



class RepairOrdersFilterDTO(BaseModel):
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


class DeviceTypeFilterDTO(BaseModel):
    device_type: str | None = None
    description: str | None = None
    offset: int = 0
    limit: int = 30