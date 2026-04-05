from database.core.database import async_engine, BaseORM
from database.models.model import UserORM


async def create_database():
    async with async_engine.begin() as conn:
        await conn.run_sync(BaseORM.metadata.create_all)