from enum import StrEnum, auto
class RoleEnum(StrEnum):
    ADMIN = "Admin"
    WORKER = "Worker"
    USER = "User"

class StatusEnum(StrEnum):
    ACCEPTED = "Accepted"
    IN_DIAGNOSTICS = "In diagnostics"
    WAITING_FOR_PARTS = "Waiting for parts"
    IN_SERVICE = "In service"
    READY_FOR_COLLECTION = "Ready for collection"
    COMPLETED = "Completed"