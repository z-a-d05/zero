"""
backend/audit_service/main.py
-----------------------------
FastAPI microservice for HIPAA/GDPR immutable append-only audit logging.
No UPDATE or DELETE endpoints are provided by design.
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database import get_db, create_tables
from shared.models import AuditLog
from shared.schemas import AuditLogCreate, AuditLogResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_tables()
    except Exception:
        pass
    yield


app = FastAPI(
    title="DPIS Audit Service",
    description="Append-only immutable audit trail service for medical compliance",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {"status": "healthy", "service": "audit_service"}


@app.post("/audit/log", response_model=AuditLogResponse, status_code=status.HTTP_201_CREATED)
async def create_log(
    payload: AuditLogCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Append an entry to the immutable audit log.
    """
    entry = AuditLog(
        user_id=payload.user_id,
        action=payload.action,
        resource_type=payload.resource_type,
        resource_id=payload.resource_id,
        ip_address=payload.ip_address,
        extra_data=payload.extra_data,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@app.get("/audit/logs", response_model=List[AuditLogResponse])
async def list_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AuditLog).offset(skip).limit(limit).order_by(AuditLog.timestamp.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)

