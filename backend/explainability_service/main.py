"""
backend/explainability_service/main.py
---------------------------------------
FastAPI microservice for SHAP and LIME model explanations.
Exposes POST /explain and GET /health.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any

from explainer import SHAPExplainer

app = FastAPI(
    title="DPIS Explainability Service",
    description="Explainable AI service using SHAP and LIME for clinical decision support",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

explainer = SHAPExplainer()


class ExplainRequest(BaseModel):
    features: dict[str, Any]
    risk_score: float
    prediction_type: str = "T2DM"


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": "explainability_service",
    }


@app.post("/explain")
async def get_explanation(payload: ExplainRequest):
    try:
        explanation = explainer.explain(payload.features, payload.risk_score)
        return explanation
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Explanation generation failed: {exc}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

