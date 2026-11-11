"""
tests/integration/test_api_gateway.py
-------------------------------------
Integration tests for FastAPI Gateway endpoints using httpx ASGITransport.
"""

import sys
from pathlib import Path
import pytest
import httpx

backend_path = Path(__file__).resolve().parent.parent.parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from api_gateway.main import app


@pytest.mark.anyio
async def test_health_check_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


@pytest.mark.anyio
async def test_root_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Diabetes Prediction Intelligence System" in data["name"]


@pytest.mark.anyio
async def test_auth_login_and_token():
    payload = {
        "email": "doctor@hospital.org",
        "password": "SecureClinicalPassword123!",
        "role": "clinician",
    }
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
