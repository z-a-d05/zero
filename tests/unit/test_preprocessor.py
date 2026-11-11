"""
tests/unit/test_preprocessor.py
-------------------------------
Unit tests for medical feature preprocessing and normalization.
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "backend"))

from prediction_service.preprocessor import FeaturePreprocessor


def test_preprocessor_imputation():
    preprocessor = FeaturePreprocessor()
    # Test with empty inputs - should populate with clinical standard defaults
    processed = preprocessor.process({})
    assert "age" in processed
    assert "bmi" in processed
    assert "hba1c" in processed
    assert "fasting_glucose" in processed
    assert processed["age"] == 45.0
    assert processed["bmi"] == 27.0


def test_preprocessor_clamping():
    preprocessor = FeaturePreprocessor()
    # Physiologically impossible values should be clamped
    raw = {
        "age": 250,      # Should be clamped to 130
        "bmi": 120,      # Should be clamped to 80
        "hba1c": 2.1,    # Should be clamped to 3.0
    }
    processed = preprocessor.process(raw)
    assert processed["age"] == 130.0
    assert processed["bmi"] == 80.0
    assert processed["hba1c"] == 3.0


def test_preprocessor_derived_features():
    preprocessor = FeaturePreprocessor()
    # High risk inputs should produce diabetic categorizations
    raw = {
        "bmi": 32.5,
        "hba1c": 6.8,
        "fasting_glucose": 135.0,
        "blood_pressure_sys": 145.0,
        "blood_pressure_dia": 92.0,
    }
    processed = preprocessor.process(raw)
    assert processed["bmi_category"] == 2.0     # Obese
    assert processed["hba1c_category"] == 2.0   # Diabetic range (>=6.5%)
    assert processed["glucose_category"] == 2.0 # Impaired/Diabetic range (>=126)
    assert processed["bp_elevated"] == 1.0      # Elevated
    assert processed["metabolic_risk_score"] > 0.5

