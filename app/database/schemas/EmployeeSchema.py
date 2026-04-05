from pydantic import BaseModel, Field, EmailStr
from tools.types import RoleEnum



class EmployeeDTO(BaseModel):
    login: str = Field(max_length=50)
    email: EmailStr = Field(max_length=50)
    password_hash: str
    role: RoleEnum
    is_active: bool = True
    must_change_password: bool = True
    reset_token_hash: str
    