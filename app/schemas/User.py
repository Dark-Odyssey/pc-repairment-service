from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from tools.types import RoleEnum



class UserCreateDTO(BaseModel):
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    email: EmailStr = Field(max_length=50)
    role: RoleEnum
    password: str = Field(min_length=8)
    is_active: bool = False


class UserDTO(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    role: RoleEnum
    is_active: bool
    created_at: datetime
    updated_at: datetime

class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    role: RoleEnum | None = None
    is_active: bool | None = None

class UserFilterDTO(UserUpdate):
        offset: int = Field(default=0)
        limit: int = Field(default=10)