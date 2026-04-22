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

async def add_admin():
    admin = UserCreateFullDTO(
        first_name="Ivan",
        last_name="Poliakov",
        phone_number="+48 123 456 789", # type: ignore
        email="user@example.com",
        role=RoleEnum.ADMIN,
        password=Crypt.hash_password("stringst"),
        is_active=True
    )
    async with AsyncSessionGenerator() as session:
        try:
            await UserRepo(session=session).create_user_full(admin)
            await session.commit()
        except IntegrityError as e:
            print(e)
