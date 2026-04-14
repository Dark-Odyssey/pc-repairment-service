from pydantic import BaseModel
from .RepairOrdersHistory import RepairOrderHistoryFullDTO, RepairOrdersHistoryUserDTO
from .RepairOrders import RepairOrdersDTO, RepairOrderUserDTO
from .User import UserOutputDTO, UserFullOutput
from .DeviceType import DeviceTypeDTO


class WorkerInfoDTO(BaseModel):
    first_name: str
    last_name: str

class ClientInfoDTO(WorkerInfoDTO):
    email: str
    phone_number: str

class DeviceInfoDTO(BaseModel):
    device_type: str

class RepairOrdersRelDTO(RepairOrdersDTO):
    client: ClientInfoDTO
    worker_created: WorkerInfoDTO
    worker_updated: WorkerInfoDTO
    device_type: DeviceInfoDTO

class RepairOrdersHistRelDTO(RepairOrdersRelDTO):
    history: list[RepairOrderHistoryFullDTO] = []

class RepairOrdersRelClientDTO(RepairOrdersDTO):
    worker_created: WorkerInfoDTO
    worker_updated: WorkerInfoDTO
    device_type: DeviceInfoDTO

class RepairOrdersRelDeviceTypeDTO(RepairOrdersDTO):
    client: ClientInfoDTO
    worker_created: WorkerInfoDTO
    worker_updated: WorkerInfoDTO


class UserOrderRelDTO(UserOutputDTO):
    orders: list[RepairOrdersRelClientDTO] = []

class UserOrderFullRelDTO(UserFullOutput):
    orders: list[RepairOrdersRelClientDTO] = []

class DeviceTypeRelDTO(DeviceTypeDTO):
    orders: list[RepairOrdersRelDeviceTypeDTO] = []

class RepairOrderUserRelDTO(RepairOrderUserDTO):
    device_type: DeviceInfoDTO
    history: list[RepairOrdersHistoryUserDTO] = []