"""
backend/api_gateway/routers/predictions.py
-------------------------------------------
Prediction, What-If simulation, and Explainability router.
Orchestrates calls to Prediction and Explainability services,
persists records, and appends to the immutable audit log.
"""

import os
from typing import Any, List
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database import get_db
from shared.models import Patient, PredictionRecord, AuditLog, PredictionType, RiskCategory, User
from shared.schemas import (
    PredictionRequest,
    PredictionResponse,
    WhatIfRequest,
    WhatIfResponse,
    RiskLevel,
    PredictionTypeEnum,
)
from api_gateway.routers.auth import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions & Explanations"])

PREDICTION_SERVICE_URL = os.getenv("PREDICTION_SERVICE_URL", "http://localhost:8001")
EXPLAINABILITY_SERVICE_URL = os.getenv("EXPLAINABILITY_SERVICE_URL", "http://localhost:8002")


async def call_prediction_service(features: dict[str, Any], prediction_type: str) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                f"{PREDICTION_SERVICE_URL}/predict",
                json={"prediction_type": prediction_type, **features},
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass

    # Direct fallback if service is running in-process or standalone
    from prediction_service.preprocessor import FeaturePreprocessor
    from prediction_service.predictor import DiabetesPredictor

    prep = FeaturePreprocessor()
    pred = DiabetesPredictor()
    processed = prep.process(features)
    return pred.predict(processed, prediction_type=prediction_type)


async def call_explainability_service(features: dict[str, Any], risk_score: float, prediction_type: str) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(
                f"{EXPLAINABILITY_SERVICE_URL}/explain",
                json={"features": features, "risk_score": risk_score, "prediction_type": prediction_type},
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass

    # Direct fallback
    from explainability_service.explainer import SHAPExplainer
    explainer = SHAPExplainer()
    return explainer.explain(features, risk_score)


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def generate_prediction(
    payload: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Patient).where(Patient.id == payload.patient_id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    features = {
        "age": patient.age,
        "gender": patient.gender,
        "bmi": patient.bmi,
        "hba1c": patient.hba1c,
        "fasting_glucose": patient.fasting_glucose,
        "blood_pressure_sys": patient.blood_pressure_sys,
        "blood_pressure_dia": patient.blood_pressure_dia,
        "family_history": patient.family_history,
        "physical_activity_level": patient.physical_activity_level.value,
        "smoking_status": patient.smoking_status,
    }
    if payload.features:
        features.update(payload.features)

    # 1. Run prediction
    pred_result = await call_prediction_service(features, payload.prediction_type.value)
    risk_score = float(pred_result["risk_score"])
    risk_cat = pred_result["risk_category"]

    # 2. Run explainability
    explanation = await call_explainability_service(features, risk_score, payload.prediction_type.value)

    # 3. Save prediction record
    record = PredictionRecord(
        patient_id=patient.id,
        prediction_type=PredictionType(payload.prediction_type.value),
        risk_score=risk_score,
        risk_category=RiskCategory(risk_cat),
        model_version=pred_result.get("model_version", "xgboost-v1.0"),
        shap_values=explanation.get("shap_explanation"),
        lime_explanation=explanation.get("lime_explanation"),
        input_features=features,
    )
    db.add(record)

    # 4. Save audit log entry
    audit = AuditLog(
        user_id=str(current_user.id),
        action="GENERATE_PREDICTION",
        resource_type="PredictionRecord",
        resource_id=str(record.id),
        extra_data={"patient_id": str(patient.id), "risk_score": risk_score},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(record)

    return PredictionResponse(
        id=record.id,
        patient_id=record.patient_id,
        prediction_type=payload.prediction_type,
        risk_score=record.risk_score,
        risk_category=RiskLevel(record.risk_category.value),
        risk_percentage=round(record.risk_score * 100, 1),
        model_version=record.model_version,
        shap_explanation=explanation.get("shap_explanation"),
        lime_explanation=explanation.get("lime_explanation"),
        input_features=features,
        created_at=record.created_at,
    )


@router.post("/whatif", response_model=WhatIfResponse)
async def simulate_whatif(
    payload: WhatIfRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Patient).where(Patient.id == payload.patient_id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found")

    base_features = {
        "age": patient.age,
        "gender": patient.gender,
        "bmi": patient.bmi,
        "hba1c": patient.hba1c,
        "fasting_glucose": patient.fasting_glucose,
        "blood_pressure_sys": patient.blood_pressure_sys,
        "blood_pressure_dia": patient.blood_pressure_dia,
        "family_history": patient.family_history,
        "physical_activity_level": patient.physical_activity_level.value,
        "smoking_status": patient.smoking_status,
    }

    # Baseline prediction
    base_pred = await call_prediction_service(base_features, payload.prediction_type.value)
    orig_score = float(base_pred["risk_score"])
    orig_cat = base_pred["risk_category"]

    # Modified prediction
    mod_features = base_features.copy()
    mod_features.update(payload.modifications)

    mod_pred = await call_prediction_service(mod_features, payload.prediction_type.value)
    mod_score = float(mod_pred["risk_score"])
    mod_cat = mod_pred["risk_category"]

    # Explanation for modified scenario
    mod_explanation = await call_explainability_service(mod_features, mod_score, payload.prediction_type.value)

    # Audit log
    audit = AuditLog(
        user_id=str(current_user.id),
        action="SIMULATE_WHATIF",
        resource_type="Patient",
        resource_id=str(patient.id),
        extra_data={"delta": round(mod_score - orig_score, 4)},
    )
    db.add(audit)
    await db.commit()

    return WhatIfResponse(
        patient_id=patient.id,
        prediction_type=payload.prediction_type,
        original_risk_score=orig_score,
        original_risk_category=RiskLevel(orig_cat),
        modified_risk_score=mod_score,
        modified_risk_category=RiskLevel(mod_cat),
        risk_delta=round(mod_score - orig_score, 4),
        modified_shap_explanation=mod_explanation.get("shap_explanation"),
        modifications_applied=payload.modifications,
    )


@router.get("/patient/{patient_id}", response_model=List[PredictionResponse])
async def get_patient_predictions(
    patient_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(PredictionRecord)
        .where(PredictionRecord.patient_id == patient_id)
        .order_by(PredictionRecord.created_at.desc())
    )
    result = await db.execute(stmt)
    records = result.scalars().all()

    return [
        PredictionResponse(
            id=r.id,
            patient_id=r.patient_id,
            prediction_type=PredictionTypeEnum(r.prediction_type.value),
            risk_score=r.risk_score,
            risk_category=RiskLevel(r.risk_category.value),
            risk_percentage=round(r.risk_score * 100, 1),
            model_version=r.model_version,
            shap_explanation=r.shap_values,
            lime_explanation=r.lime_explanation,
            input_features=r.input_features,
            created_at=r.created_at,
        )
        for r in records
    ]

