from core.database import async_engine, BaseORM, AsyncSessionGenerator, DataBase
from database.models import UserORM, RepairOrdersORM, OrderStatusHistoryORM, PasswordResetsORM
from database.repos import UserRepo
from schemas import UserCreateDTO
from tools.types import RoleEnum

async def create_database():
    async with async_engine.begin() as conn:
        await conn.run_sync(BaseORM.metadata.create_all)

async def add_admin():
    admin = UserCreateDTO(
        first_name="Ivan",
        last_name="Poliakov",
        email="ivan_poliakov@gmail.com",
        role=RoleEnum.ADMIN,
        password="vaniahuesos",
        is_active=True
    )
    async with AsyncSessionGenerator() as session:
        try:
            await UserRepo(session=session).create_user(admin)
            await session.commit()
        except Exception:
            print("Admin already in database")
