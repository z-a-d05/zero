"""
tests/unit/test_explainer.py
----------------------------
Unit tests for the SHAP and LIME explainability engine.
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent / "backend"))

from explainability_service.explainer import SHAPExplainer


def test_explainer_structure():
    explainer = SHAPExplainer()
    features = {
        "hba1c": 6.8,
        "fasting_glucose": 130.0,
        "bmi": 31.0,
        "family_history": True,
        "physical_activity_level": "low",
    }
    result = explainer.explain(features, risk_score=0.75)

    assert "shap_explanation" in result
    assert "lime_explanation" in result

    shap = result["shap_explanation"]
    assert "base_value" in shap
    assert "feature_contributions" in shap
    assert "top_factors" in shap
    assert len(shap["top_factors"]) <= 3

    # High HbA1c should have a positive impact direction
    hba1c_factor = next(f for f in shap["feature_contributions"] if f["feature"] == "hba1c")
    assert hba1c_factor["impact_direction"] == "positive"
    assert hba1c_factor["shap_value"] > 0


def test_lime_rules_generation():
    explainer = SHAPExplainer()
    features = {
        "hba1c": 7.2,
        "fasting_glucose": 140.0,
        "bmi": 32.0,
    }
    result = explainer.explain(features, risk_score=0.82)
    lime = result["lime_explanation"]

    assert len(lime["simple_rules"]) > 0
    # Should flag diabetic range in rule text
    assert any("diagnostic diabetes range" in r or "≥6.5%" in r for r in lime["simple_rules"])

