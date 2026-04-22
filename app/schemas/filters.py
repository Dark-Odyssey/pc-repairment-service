from typing import Sequence
from pydantic import BaseModel, Field, ConfigDict
from .RepairOrders import RepairOrdersDTO, RepairOrderUserDTO
from .relationship import RepairOrderUserRelDTO, RepairOrdersRelDTO
from .DeviceType import DeviceTypeDTO
from .User import UserOutputDTO, UserFullOutput, UserOutputWorkerDTO
from tools.types import RoleEnum, StatusEnum



class PaginationDTO(BaseModel):
    total: int
    offset: int
    limit: int
    page: int
    pages: int
    has_prev: bool
    has_next: bool


class UserFilterWorkerDTO(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    offset: int =  Field(ge=0, default=0)
    limit: int = Field(ge=0, default=30)

class UserFilterAdminDTO(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    role: RoleEnum | None = None
    is_active: bool | None = None
    offset: int =  Field(ge=0, default=0)
    limit: int = Field(ge=0, default=30)


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
    offset: int =  Field(ge=0, default=0)
    limit: int = Field(ge=0, default=30)


class DeviceTypeFilterDTO(BaseModel):
    device_type: str | None = None
    description: str | None = None
    offset: int =  Field(ge=0, default=0)
    limit: int = Field(ge=0, default=30)


class UserWorkerPaginationDTO(BaseModel):
    result: Sequence[UserOutputWorkerDTO]
    pagination: PaginationDTO


class UserAdminPaginationDTO(BaseModel):
    result: Sequence[UserFullOutput]
    pagination: PaginationDTO


class RepairOrdersPaginationDTO(BaseModel):
    result: Sequence[RepairOrdersRelDTO]
    pagination: PaginationDTO


class DeviceTypePaginationDTO(BaseModel):
    result: Sequence[DeviceTypeDTO]
    pagination: PaginationDTO

class RepairOrdersUserPaginationDTO(BaseModel):
    result: Sequence[RepairOrderUserRelDTO]
    pagination: PaginationDTO