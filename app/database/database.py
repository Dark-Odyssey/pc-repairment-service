from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from database.config import settings

async_engine = create_async_engine(
    url=settings.DATABASE_URL,
    # echo=True
)

AsyncSessionGenerator = async_sessionmaker(
    bind=async_engine,
    autoflush=False,
    autocommit=False,
)

class Base(DeclarativeBase):
    pass