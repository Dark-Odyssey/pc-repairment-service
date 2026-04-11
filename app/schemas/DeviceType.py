from pydantic import BaseModel, Field


class DeviceTypeCreateDTO(BaseModel):
    device_type: str = Field(max_length=50)
    description: str | None = Field(max_length=256)


class DeviceTypeDTO(DeviceTypeCreateDTO):
    id: int


class DeviceTypeSeachDTO(BaseModel):
    device_type: str | None = None

class DeviceTypeUpdateDTO(DeviceTypeSeachDTO):
    description: str | None = None