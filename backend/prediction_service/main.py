"""
backend/prediction_service/main.py
-----------------------------------
FastAPI microservice for diabetes risk prediction.
Exposes POST /predict and GET /health.
"""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from predictor import DiabetesPredictor
from preprocessor import FeaturePreprocessor

predictor: DiabetesPredictor | None = None
preprocessor: FeaturePreprocessor | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor, preprocessor
    preprocessor = FeaturePreprocessor()
    predictor = DiabetesPredictor()
    yield


app = FastAPI(
    title="DPIS Prediction Service",
    description="Machine Learning inference service for diabetes risk stratification",
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


class PredictIn(BaseModel):
    prediction_type: str = Field(default="T2DM")
    age: float = 45.0
    bmi: float = 26.0
    hba1c: float = 5.6
    fasting_glucose: float = 95.0
    blood_pressure_sys: float = 120.0
    blood_pressure_dia: float = 80.0
    family_history: bool = False
    physical_activity_level: str = "medium"
    smoking_status: bool = False
    gender: str = "M"


class PredictOut(BaseModel):
    risk_score: float
    risk_category: str
    model_version: str
    input_features: dict[str, Any]


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": "prediction_service",
        "model_loaded": predictor is not None,
    }


@app.post("/predict", response_model=PredictOut)
async def predict_risk(payload: PredictIn):
    if predictor is None or preprocessor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Predictor engine is not initialised.",
        )

    try:
        raw_dict = payload.model_dump()
        ptype = raw_dict.pop("prediction_type", "T2DM")
        processed_features = preprocessor.process(raw_dict)
        prediction = predictor.predict(processed_features, prediction_type=ptype)
        return PredictOut(**prediction)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inference error: {exc}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

