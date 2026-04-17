from pydantic import BaseModel, Field, ConfigDict


class DeviceTypeCreateDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    device_type: str = Field(max_length=50)
    description: str | None = Field(max_length=256)


class DeviceTypeDTO(DeviceTypeCreateDTO):
    id: int

class DeviceTypeUpdateDTO(BaseModel):
    device_type: str | None = None
    description: str | None = None