"""
backend/run_server.py
---------------------
Direct launcher for running DPIS API Gateway and backend locally without Docker.
"""

import sys
from pathlib import Path

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import uvicorn
from api_gateway.main import app

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  🚀 DPIS - Diabetes Prediction Intelligence System")
    print("  API Gateway running at: http://127.0.0.1:8000")
    print("  Interactive Swagger Docs: http://127.0.0.1:8000/api/docs")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)

