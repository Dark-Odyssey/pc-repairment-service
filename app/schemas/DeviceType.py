from pydantic import BaseModel, Field


class DeviceTypeCreateDTO(BaseModel):
    device_type: str = Field(max_length=50)
    description: str | None = Field(max_length=256)


class DeviceTypeDTO(DeviceTypeCreateDTO):
    id: int

class DeviceTypeUpdateDTO(BaseModel):
    device_type: str | None = None
    description: str | None = None