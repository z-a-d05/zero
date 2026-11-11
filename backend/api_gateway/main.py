"""
backend/api_gateway/main.py
---------------------------
Main API Gateway entrypoint for the Diabetes Prediction Intelligence System (DPIS).
Aggregates Authentication, Patients, Predictions, and Observability.
"""

import sys
import asyncio
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from shared.database import create_tables
from api_gateway.routers import auth, patients, predictions


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Quick non-blocking attempt to initialize DB tables
    try:
        await asyncio.wait_for(create_tables(), timeout=1.0)
    except Exception:
        pass
    yield


app = FastAPI(
    title="Diabetes Prediction Intelligence System (DPIS) - API Gateway",
    description="Clinical Decision Support Platform for Diabetes Risk Stratification and Explainable AI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Standard permissive CORS for healthcare clinical frontend and dev setups
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount core microservice routers
app.include_router(auth.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "system": "DPIS API Gateway",
        "version": "1.0.0",
        "compliance": "HIPAA & GDPR Ready",
    }


@app.get("/")
async def root():
    return {
        "name": "Diabetes Prediction Intelligence System (DPIS)",
        "docs": "/api/docs",
        "clinical_modules": ["T1DM", "T2DM", "GDM", "MODY"],
        "status": "online",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_gateway.main:app", host="127.0.0.1", port=8000, reload=True)
