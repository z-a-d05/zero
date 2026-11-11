"""
shared/database.py
------------------
Async SQLAlchemy engine and session factory.
Includes instant port check so non-Docker / offline environments don't hang.
"""

import os
import socket
from collections.abc import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/dpis",
)

def is_db_reachable() -> bool:
    """Fast synchronous socket check to avoid 30s connection hangs."""
    if "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.3)
            result = sock.connect_ex(("127.0.0.1", 5432))
            sock.close()
            return result == 0
        except Exception:
            return False
    return True

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    if not is_db_reachable():
        yield None
        return

    try:
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    except Exception:
        yield None


async def create_tables() -> None:
    """Attempt table creation only if database host is reachable."""
    if not is_db_reachable():
        return

    try:
        import shared.models  # noqa: F401
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception:
        pass
