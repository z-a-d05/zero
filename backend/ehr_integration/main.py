"""
backend/ehr_integration/main.py
-------------------------------
FastAPI service exposing HL7 FHIR and CDS Hooks interoperability endpoints.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict

from fhir_client import FHIRClient, CDSHooksHandler

app = FastAPI(
    title="DPIS EHR Integration Service",
    description="HL7 FHIR R4 interoperability and CDS Hooks service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fhir_client = FHIRClient()


class CDSHookRequest(BaseModel):
    hook: str
    hookInstance: str
    context: Dict[str, Any]


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": "ehr_integration",
        "fhir_version": "R4",
        "cds_hooks_version": "1.0",
    }


@app.get("/fhir/patient/{patient_id}")
async def pull_fhir_patient(patient_id: str):
    patient_data = await fhir_client.get_patient(patient_id)
    labs = await fhir_client.get_patient_observations(patient_id)
    return {
        "patient": patient_data,
        "observations": labs,
        "source": "HL7 FHIR R4 Server",
    }


@app.post("/cds-services/patient-view")
async def cds_patient_view(payload: CDSHookRequest):
    """
    Standard CDS Hook triggered when a clinician opens a patient chart in the EHR.
    """
    patient_id = payload.context.get("patientId", "unknown")
    cards = CDSHooksHandler.evaluate_patient_view_hook(patient_id, risk_score=0.74, risk_category="high")
    return cards


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)

