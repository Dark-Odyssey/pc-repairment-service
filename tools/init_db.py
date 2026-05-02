from core.database import async_engine, BaseORM, AsyncSessionGenerator
from database.models import UserORM, RepairOrdersORM, OrderStatusHistoryORM, PasswordResetORM, DeviceTypeORM
from security.encryption import Crypt
from database.repos import UserRepo
from sqlalchemy.exc import IntegrityError
from schemas import UserCreateFullDTO
from tools.types import RoleEnum

async def create_database():
    async with async_engine.begin() as conn:
        await conn.run_sync(BaseORM.metadata.create_all)