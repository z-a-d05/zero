"""
tests/unit/test_predictor.py
----------------------------
Unit tests for the diabetes risk predictor.
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "backend"))

from prediction_service.predictor import DiabetesPredictor
from prediction_service.preprocessor import FeaturePreprocessor


def test_predictor_t2dm_healthy():
    preprocessor = FeaturePreprocessor()
    predictor = DiabetesPredictor()

    healthy_patient = {
        "age": 30,
        "bmi": 21.5,
        "hba1c": 5.0,
        "fasting_glucose": 85.0,
        "blood_pressure_sys": 115.0,
        "blood_pressure_dia": 75.0,
        "family_history": False,
        "physical_activity_level": "high",
        "smoking_status": False,
    }
    processed = preprocessor.process(healthy_patient)
    result = predictor.predict(processed, prediction_type="T2DM")

    assert result["risk_category"] == "low"
    assert result["risk_score"] < 0.35


def test_predictor_t2dm_high_risk():
    preprocessor = FeaturePreprocessor()
    predictor = DiabetesPredictor()

    high_risk_patient = {
        "age": 62,
        "bmi": 34.0,
        "hba1c": 7.1,
        "fasting_glucose": 145.0,
        "blood_pressure_sys": 150.0,
        "blood_pressure_dia": 95.0,
        "family_history": True,
        "physical_activity_level": "low",
        "smoking_status": True,
    }
    processed = preprocessor.process(high_risk_patient)
    result = predictor.predict(processed, prediction_type="T2DM")

    assert result["risk_category"] == "high"
    assert result["risk_score"] > 0.65


def test_predictor_supported_subtypes():
    preprocessor = FeaturePreprocessor()
    predictor = DiabetesPredictor()
    processed = preprocessor.process({"age": 22, "hba1c": 6.8})

    for ptype in ["T2DM", "T1DM", "GDM", "MODY"]:
        res = predictor.predict(processed, prediction_type=ptype)
        assert 0.0 <= res["risk_score"] <= 1.0
        assert res["risk_category"] in ["low", "medium", "high"]

