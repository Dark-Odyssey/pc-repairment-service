from typing import Annotated, AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from database.core.config import settings

async_engine = create_async_engine(
    url=settings.DATABASE_URL,
    # echo=True
)

AsyncSessionGenerator = async_sessionmaker(
    bind=async_engine,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    db = AsyncSessionGenerator()
    try:
        yield db
    finally:
        await db.close()


DataBase = Annotated[AsyncSession, Depends(get_db)]

class BaseORM(DeclarativeBase):
    pass