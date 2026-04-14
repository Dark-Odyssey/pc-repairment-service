from pydantic import BaseModel, Field, ConfigDict


class DeviceTypeCreateDTO(BaseModel):
    device_type: str = Field(max_length=50)
    description: str | None = Field(max_length=256)


class DeviceTypeDTO(DeviceTypeCreateDTO):
    model_config = ConfigDict(from_attributes=True)
    id: int

class DeviceTypeUpdateDTO(BaseModel):
    device_type: str | None = None
    description: str | None = None