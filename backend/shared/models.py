"""
shared/models.py
----------------
SQLAlchemy ORM models for the DPIS (Diabetes Prediction Intelligence System).

Tables
------
- users           — application users (patients, clinicians, admins)
- patients        — patient demographic and clinical data
- prediction_records — ML prediction results linked to patients
- audit_logs      — append-only audit trail (never updated or deleted)
"""

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class PhysicalActivityLevel(str, enum.Enum):
    """Descriptive physical-activity categories used for risk stratification."""

    low = "low"
    medium = "medium"
    high = "high"


class PredictionType(str, enum.Enum):
    """Supported diabetes subtype prediction targets."""

    T2DM = "T2DM"
    T1DM = "T1DM"
    GDM = "GDM"
    MODY = "MODY"


class RiskCategory(str, enum.Enum):
    """Clinically meaningful risk strata returned by the predictor."""

    low = "low"
    medium = "medium"
    high = "high"


class UserRole(str, enum.Enum):
    """Access-control roles within the platform."""

    patient = "patient"
    clinician = "clinician"
    admin = "admin"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------


class User(Base):
    """Application user record — stores credentials and role."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.patient,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"


# ---------------------------------------------------------------------------
# Patient
# ---------------------------------------------------------------------------


class Patient(Base):
    """
    Clinical profile for a single patient.

    Stores the raw demographic and biometric features used by the ML
    prediction pipeline.  One patient may have many
    :class:`PredictionRecord` rows over time.
    """

    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(10), nullable=False)  # M / F / Other
    bmi: Mapped[float] = mapped_column(Float, nullable=False)
    hba1c: Mapped[float] = mapped_column(Float, nullable=False)
    fasting_glucose: Mapped[float] = mapped_column(Float, nullable=False)
    blood_pressure_sys: Mapped[float] = mapped_column(Float, nullable=False)
    blood_pressure_dia: Mapped[float] = mapped_column(Float, nullable=False)
    family_history: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    physical_activity_level: Mapped[PhysicalActivityLevel] = mapped_column(
        Enum(PhysicalActivityLevel, name="physical_activity_level"),
        nullable=False,
        default=PhysicalActivityLevel.medium,
    )
    smoking_status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationship — back-populates on PredictionRecord
    predictions: Mapped[list["PredictionRecord"]] = relationship(
        "PredictionRecord",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Patient id={self.id} name={self.name}>"


# ---------------------------------------------------------------------------
# PredictionRecord
# ---------------------------------------------------------------------------


class PredictionRecord(Base):
    """
    Immutable snapshot of a single ML prediction run for a patient.

    Stores the raw input features, model output, SHAP values, and LIME
    explanations so the full audit trail is self-contained.
    """

    __tablename__ = "prediction_records"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    prediction_type: Mapped[PredictionType] = mapped_column(
        Enum(PredictionType, name="prediction_type"),
        nullable=False,
        default=PredictionType.T2DM,
    )
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_category: Mapped[RiskCategory] = mapped_column(
        Enum(RiskCategory, name="risk_category"),
        nullable=False,
    )
    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="heuristic-v1",
    )
    shap_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    lime_explanation: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    input_features: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationship
    patient: Mapped["Patient"] = relationship(
        "Patient",
        back_populates="predictions",
    )

    def __repr__(self) -> str:
        return (
            f"<PredictionRecord id={self.id} patient={self.patient_id} "
            f"type={self.prediction_type} score={self.risk_score:.3f}>"
        )


# ---------------------------------------------------------------------------
# AuditLog
# ---------------------------------------------------------------------------


class AuditLog(Base):
    """
    Append-only audit trail entry.

    **Never update or delete rows from this table.**  The table captures
    who did what to which resource and from where, satisfying HIPAA-style
    audit requirements.
    """

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    extra_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    def __repr__(self) -> str:
        return (
            f"<AuditLog id={self.id} user={self.user_id} "
            f"action={self.action} resource={self.resource_type}/{self.resource_id}>"
        )
