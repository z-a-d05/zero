"""
backend/api_gateway/routers/patients.py
---------------------------------------
Patient management router for API Gateway.
Includes sorting by latest risk score, filtering, and role-based access.
Supports resilient offline / local fallback mode if PostgreSQL is not active.
"""

from datetime import datetime, timezone
from typing import List, Optional
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from shared.database import get_db
from shared.models import Patient, PredictionRecord, User, PhysicalActivityLevel
from shared.schemas import PatientCreate, PatientUpdate, PatientResponse
from api_gateway.routers.auth import get_current_user, require_clinician_or_admin

router = APIRouter(prefix="/patients", tags=["Patients"])

# In-memory clinical roster for offline/standalone execution
FALLBACK_PATIENTS: List[PatientResponse] = [
    PatientResponse(
        id=UUID("11111111-1111-1111-1111-111111111101"),
        name="Eleanor Vance",
        age=58,
        gender="F",
        bmi=32.4,
        hba1c=6.8,
        fasting_glucose=138.0,
        blood_pressure_sys=144.0,
        blood_pressure_dia=92.0,
        family_history=True,
        physical_activity_level=PhysicalActivityLevel.low,
        smoking_status=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
    PatientResponse(
        id=UUID("11111111-1111-1111-1111-111111111102"),
        name="Marcus Thorne",
        age=49,
        gender="M",
        bmi=28.1,
        hba1c=5.9,
        fasting_glucose=112.0,
        blood_pressure_sys=132.0,
        blood_pressure_dia=84.0,
        family_history=True,
        physical_activity_level=PhysicalActivityLevel.medium,
        smoking_status=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
    PatientResponse(
        id=UUID("11111111-1111-1111-1111-111111111103"),
        name="Sophia Chen",
        age=34,
        gender="F",
        bmi=21.8,
        hba1c=5.1,
        fasting_glucose=86.0,
        blood_pressure_sys=116.0,
        blood_pressure_dia=74.0,
        family_history=False,
        physical_activity_level=PhysicalActivityLevel.high,
        smoking_status=False,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    ),
]


@router.get("/", response_model=List[PatientResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    sort_by_risk: bool = False,
    current_user: User = Depends(require_clinician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    try:
        query = select(Patient).options(selectinload(Patient.predictions))
        if search:
            query = query.where(Patient.name.ilike(f"%{search}%"))

        result = await db.execute(query)
        patients = result.scalars().all()

        if sort_by_risk:
            def get_max_risk(p: Patient) -> float:
                if not p.predictions:
                    return -1.0
                return max(pred.risk_score for pred in p.predictions)
            patients = sorted(patients, key=get_max_risk, reverse=True)
        else:
            patients = sorted(patients, key=lambda p: p.created_at, reverse=True)

        return patients[skip : skip + limit]
    except Exception:
        # Seamless offline fallback
        items = list(FALLBACK_PATIENTS)
        if search:
            items = [p for p in items if search.lower() in p.name.lower()]
        return items[skip : skip + limit]


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        patient = Patient(**payload.model_dump())
        db.add(patient)
        await db.commit()
        await db.refresh(patient)
        return patient
    except Exception:
        new_p = PatientResponse(
            id=uuid.uuid4(),
            **payload.model_dump(),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        FALLBACK_PATIENTS.insert(0, new_p)
        return new_p


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient_detail(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = select(Patient).options(selectinload(Patient.predictions)).where(Patient.id == patient_id)
        result = await db.execute(stmt)
        patient = result.scalar_one_or_none()
        if patient:
            return patient
    except Exception:
        pass

    for p in FALLBACK_PATIENTS:
        if p.id == patient_id:
            return p

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient_profile(
    patient_id: UUID,
    payload: PatientUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        stmt = select(Patient).where(Patient.id == patient_id)
        result = await db.execute(stmt)
        patient = result.scalar_one_or_none()
        if patient:
            update_dict = payload.model_dump(exclude_unset=True)
            for field, val in update_dict.items():
                setattr(patient, field, val)
            await db.commit()
            await db.refresh(patient)
            return patient
    except Exception:
        pass

    for i, p in enumerate(FALLBACK_PATIENTS):
        if p.id == patient_id:
            updated_data = p.model_dump()
            updated_data.update(payload.model_dump(exclude_unset=True))
            FALLBACK_PATIENTS[i] = PatientResponse(**updated_data)
            return FALLBACK_PATIENTS[i]

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
