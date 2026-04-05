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


class UserDTO(UserCreateDTO):
    id: int
    created_at: datetime
    updated_at: datetime