from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from pydantic_extra_types.phone_numbers import PhoneNumber
from tools.types import RoleEnum


class UpdatePasswordDTO(BaseModel):
    new_password: str = Field(min_length=8, max_length=20)
    retry_password: str

class UserCreateWorkerDTO(BaseModel):
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    email: EmailStr = Field(max_length=50)
    phone_number: PhoneNumber

class UserRegisterDTO(UserCreateWorkerDTO):
    password: str = Field(min_length=8, max_length=20)

class UserCreateAdminDTO(UserCreateWorkerDTO):
    role: RoleEnum

class UserCreateFullDTO(UserCreateAdminDTO):
    password: str = Field(min_length=8, max_length=20)
    is_active: bool = True

class UserOutputDTO(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: PhoneNumber
    role: RoleEnum
    is_active: bool
    created_at: datetime
    updated_at: datetime

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    role: RoleEnum | None = None
    is_active: bool | None = None

class UserFilterDTO(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone_number: PhoneNumber | None = None
    role: RoleEnum | None = None
    is_active: bool | None = None
    offset: int = Field(default=0)
    limit: int = Field(default=10)

class UserLogin(BaseModel):
    email: EmailStr = Field(max_length=50)
    password: str = Field(min_length=8, max_length=20)
