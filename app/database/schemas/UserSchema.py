from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from tools.types import RoleEnum



class UserDTO(BaseModel):
    first_name: str = Field(max_length=50)
    last_name: str = Field(max_length=50)
    email: EmailStr = Field(max_length=50)
    password: str
    role: RoleEnum
    is_active: bool = False    created_at: datetime
    updated_at: datetime