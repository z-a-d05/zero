"""
backend/federated_learning/main.py
----------------------------------
FastAPI service exposing Federated Learning orchestration and aggregation endpoints.
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from orchestrator import FederatedOrchestrator

app = FastAPI(
    title="DPIS Federated Learning Orchestrator",
    description="Privacy-preserving Federated Learning coordinator for multi-hospital model training",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = FederatedOrchestrator()


@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": "federated_learning_orchestrator",
        "privacy_guarantee": "Differential Privacy (DP) & FedAvg",
    }


@app.get("/federated/status")
async def get_federated_status():
    return orchestrator.get_status()


@app.post("/federated/train-round")
async def trigger_federated_round():
    return orchestrator.execute_training_round()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)

