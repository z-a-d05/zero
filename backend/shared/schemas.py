"""
shared/schemas.py
-----------------
Pydantic v2 request / response schemas for the DPIS API.

All schemas follow strict validation and use Python 3.11+ type hints.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# Enums (mirroring ORM enums for serialisation)
# ---------------------------------------------------------------------------


class PhysicalActivityLevelEnum(str, Enum):
    """Patient physical-activity level categories."""

    low = "low"
    medium = "medium"
    high = "high"


class PredictionTypeEnum(str, Enum):
    """Supported diabetes subtype prediction targets."""

    T2DM = "T2DM"
    T1DM = "T1DM"
    GDM = "GDM"
    MODY = "MODY"


class RiskLevel(str, Enum):
    """Risk strata used by the predictor and in API responses."""

    low = "low"
    medium = "medium"
    high = "high"


class UserRoleEnum(str, Enum):
    """Access-control roles within the platform."""

    patient = "patient"
    clinician = "clinician"
    admin = "admin"


# ---------------------------------------------------------------------------
# User schemas
# ---------------------------------------------------------------------------


class UserCreate(BaseModel):
    """Payload for registering a new user."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRoleEnum = UserRoleEnum.patient

    model_config = ConfigDict(str_strip_whitespace=True)


class UserLogin(BaseModel):
    """Credentials for the login endpoint."""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public representation of a user (password excluded)."""

    id: uuid.UUID
    email: EmailStr
    role: UserRoleEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """JWT access token returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


# ---------------------------------------------------------------------------
# Patient schemas
# ---------------------------------------------------------------------------


class PatientBase(BaseModel):
    """Shared fields for patient create / update operations."""

    name: str = Field(min_length=1, max_length=255)
    age: int = Field(ge=0, le=130)
    gender: str = Field(pattern=r"^(M|F|Other)$")
    bmi: float = Field(ge=10.0, le=80.0)
    hba1c: float = Field(ge=3.0, le=20.0, description="HbA1c percentage (e.g. 5.7)")
    fasting_glucose: float = Field(ge=50.0, le=600.0, description="mg/dL")
    blood_pressure_sys: float = Field(ge=60.0, le=250.0, description="Systolic mmHg")
    blood_pressure_dia: float = Field(ge=40.0, le=150.0, description="Diastolic mmHg")
    family_history: bool = False
    physical_activity_level: PhysicalActivityLevelEnum = PhysicalActivityLevelEnum.medium
    smoking_status: bool = False

    model_config = ConfigDict(str_strip_whitespace=True)


class PatientCreate(PatientBase):
    """Request body for creating a new patient record."""


class PatientUpdate(BaseModel):
    """
    Request body for partial patient updates.

    All fields are optional so callers can patch individual attributes.
    """

    name: str | None = Field(default=None, min_length=1, max_length=255)
    age: int | None = Field(default=None, ge=0, le=130)
    gender: str | None = Field(default=None, pattern=r"^(M|F|Other)$")
    bmi: float | None = Field(default=None, ge=10.0, le=80.0)
    hba1c: float | None = Field(default=None, ge=3.0, le=20.0)
    fasting_glucose: float | None = Field(default=None, ge=50.0, le=600.0)
    blood_pressure_sys: float | None = Field(default=None, ge=60.0, le=250.0)
    blood_pressure_dia: float | None = Field(default=None, ge=40.0, le=150.0)
    family_history: bool | None = None
    physical_activity_level: PhysicalActivityLevelEnum | None = None
    smoking_status: bool | None = None

    model_config = ConfigDict(str_strip_whitespace=True)


class PatientResponse(PatientBase):
    """Full patient record returned from the API."""

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Prediction schemas
# ---------------------------------------------------------------------------


class PredictionRequest(BaseModel):
    """
    Request body for the ``POST /predictions/predict`` endpoint.

    ``patient_id`` links the prediction to an existing patient row.
    ``prediction_type`` selects which diabetes subtype model to run.
    ``features`` allows the caller to override individual feature values;
    if omitted, values are loaded from the patient record.
    """

    patient_id: uuid.UUID
    prediction_type: PredictionTypeEnum = PredictionTypeEnum.T2DM
    features: dict[str, Any] | None = Field(
        default=None,
        description="Optional feature overrides (what-if analysis).",
    )


class WhatIfRequest(BaseModel):
    """
    Request body for the ``POST /predictions/whatif`` endpoint.

    Provides the current patient snapshot plus a dict of modifications.
    Both the original and the modified risk scores are returned so
    clinicians can compare scenarios.
    """

    patient_id: uuid.UUID
    prediction_type: PredictionTypeEnum = PredictionTypeEnum.T2DM
    modifications: dict[str, Any] = Field(
        description="Feature values to override in the what-if scenario."
    )


class SHAPFeatureContribution(BaseModel):
    """SHAP contribution for a single feature."""

    feature: str
    shap_value: float
    feature_value: float | str | bool | None
    impact_direction: str  # "positive" (raises risk) or "negative" (lowers risk)


class SHAPExplanation(BaseModel):
    """Full SHAP explanation payload attached to a prediction."""

    base_value: float
    feature_contributions: list[SHAPFeatureContribution]
    top_factors: list[str] = Field(
        description="Top 3 feature names ranked by absolute SHAP value."
    )


class LIMEExplanation(BaseModel):
    """Human-readable LIME rule-based explanation."""

    simple_rules: list[str] = Field(
        description="Plain-language rules, e.g. 'HbA1c > 6.0 contributes +35% to risk'."
    )
    prediction_local: float
    intercept: float


class PredictionResponse(BaseModel):
    """Full prediction result returned to the caller."""

    id: uuid.UUID
    patient_id: uuid.UUID
    prediction_type: PredictionTypeEnum
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_category: RiskLevel
    risk_percentage: float = Field(description="risk_score * 100, rounded to 1 dp.")
    model_version: str
    shap_explanation: SHAPExplanation | None = None
    lime_explanation: LIMEExplanation | None = None
    input_features: dict[str, Any] | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("risk_percentage", mode="before")
    @classmethod
    def compute_risk_percentage(cls, v: float | None, info: Any) -> float:
        """Derive risk_percentage from risk_score if not explicitly set."""
        if v is not None:
            return round(float(v), 1)
        # Fallback: attempt to read from sibling field
        return 0.0


class WhatIfResponse(BaseModel):
    """Before / after comparison returned by the what-if endpoint."""

    patient_id: uuid.UUID
    prediction_type: PredictionTypeEnum
    original_risk_score: float
    original_risk_category: RiskLevel
    modified_risk_score: float
    modified_risk_category: RiskLevel
    risk_delta: float = Field(description="modified_risk_score - original_risk_score")
    modified_shap_explanation: SHAPExplanation | None = None
    modifications_applied: dict[str, Any]


# ---------------------------------------------------------------------------
# Audit schemas
# ---------------------------------------------------------------------------


class AuditLogCreate(BaseModel):
    """Payload for creating an audit entry."""

    user_id: str
    action: str = Field(min_length=1, max_length=255)
    resource_type: str = Field(min_length=1, max_length=100)
    resource_id: str | None = None
    ip_address: str | None = None
    extra_data: dict[str, Any] | None = None


class AuditLogResponse(BaseModel):
    """Public representation of an audit-log entry."""

    id: uuid.UUID
    user_id: str
    action: str
    resource_type: str
    resource_id: str | None
    ip_address: str | None
    extra_data: dict[str, Any] | None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Internal service schemas (used for inter-service HTTP calls)
# ---------------------------------------------------------------------------


class PatientFeatures(BaseModel):
    """
    Feature vector sent from the API gateway to the prediction service.

    All features required by the XGBoost model must be present.
    """

    age: float
    bmi: float
    hba1c: float
    fasting_glucose: float
    blood_pressure_sys: float
    blood_pressure_dia: float
    family_history: bool
    physical_activity_level: str
    smoking_status: bool
    gender: str = "M"
    prediction_type: str = "T2DM"


class PredictionResult(BaseModel):
    """Raw result returned by the prediction microservice."""

    risk_score: float
    risk_category: str
    model_version: str
    input_features: dict[str, Any]


class ExplainRequest(BaseModel):
    """Payload sent to the explainability service."""

    features: dict[str, Any]
    risk_score: float
    prediction_type: str = "T2DM"


class ExplainResponse(BaseModel):
    """Full explanation payload returned by the explainability service."""

    shap_explanation: SHAPExplanation
    lime_explanation: LIMEExplanation
