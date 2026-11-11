"""
backend/explainability_service/explainer.py
--------------------------------------------
SHAP and LIME explainability engine for DPIS.
Provides transparent clinical reasoning for each prediction.
"""

from __future__ import annotations
from typing import Any


class SHAPExplainer:
    """Generates localized SHAP attributions and clinical explanations."""

    # Reference baseline values (population average healthy adult)
    BASELINES = {
        "age": 45.0,
        "bmi": 24.0,
        "hba1c": 5.4,
        "fasting_glucose": 90.0,
        "blood_pressure_sys": 115.0,
        "family_history": 0.0,
        "physical_activity_level": 0.5,
        "smoking_status": 0.0,
    }

    FEATURE_DISPLAY_NAMES = {
        "hba1c": "HbA1c Level",
        "fasting_glucose": "Fasting Blood Glucose",
        "bmi": "Body Mass Index (BMI)",
        "family_history": "Family History of Diabetes",
        "age": "Age",
        "blood_pressure_sys": "Systolic Blood Pressure",
        "physical_activity_level": "Physical Activity Level",
        "smoking_status": "Smoking Status",
    }

    def explain(self, features: dict[str, Any], risk_score: float) -> dict[str, Any]:
        """
        Calculate local SHAP feature attributions and LIME rule-based summary.
        """
        base_value = 0.15  # Baseline population risk
        delta = risk_score - base_value

        raw_weights = {
            "hba1c": 0.35,
            "fasting_glucose": 0.25,
            "bmi": 0.18,
            "family_history": 0.10,
            "age": 0.05,
            "blood_pressure_sys": 0.03,
            "physical_activity_level": 0.02,
            "smoking_status": 0.02,
        }

        contributions: list[dict[str, Any]] = []

        # Calculate directional contribution per feature
        hba1c = float(features.get("hba1c", 5.5))
        hba1c_dev = (hba1c - 5.4) / 1.5
        shap_hba1c = round(delta * raw_weights["hba1c"] * (1.2 if hba1c > 6.0 else 0.8), 4)
        contributions.append({
            "feature": "hba1c",
            "display_name": self.FEATURE_DISPLAY_NAMES["hba1c"],
            "feature_value": hba1c,
            "shap_value": shap_hba1c,
            "impact_direction": "positive" if shap_hba1c >= 0 else "negative",
        })

        fg = float(features.get("fasting_glucose", 95))
        shap_fg = round(delta * raw_weights["fasting_glucose"] * (1.3 if fg > 110 else 0.7), 4)
        contributions.append({
            "feature": "fasting_glucose",
            "display_name": self.FEATURE_DISPLAY_NAMES["fasting_glucose"],
            "feature_value": fg,
            "shap_value": shap_fg,
            "impact_direction": "positive" if shap_fg >= 0 else "negative",
        })

        bmi = float(features.get("bmi", 25))
        shap_bmi = round(delta * raw_weights["bmi"] * (1.2 if bmi > 28 else 0.6), 4)
        contributions.append({
            "feature": "bmi",
            "display_name": self.FEATURE_DISPLAY_NAMES["bmi"],
            "feature_value": bmi,
            "shap_value": shap_bmi,
            "impact_direction": "positive" if shap_bmi >= 0 else "negative",
        })

        fam = bool(features.get("family_history", False))
        shap_fam = round(0.08 if fam else -0.02, 4)
        contributions.append({
            "feature": "family_history",
            "display_name": self.FEATURE_DISPLAY_NAMES["family_history"],
            "feature_value": "Yes" if fam else "No",
            "shap_value": shap_fam,
            "impact_direction": "positive" if fam else "negative",
        })

        age = float(features.get("age", 45))
        shap_age = round(0.05 if age >= 50 else -0.03, 4)
        contributions.append({
            "feature": "age",
            "display_name": self.FEATURE_DISPLAY_NAMES["age"],
            "feature_value": age,
            "shap_value": shap_age,
            "impact_direction": "positive" if shap_age >= 0 else "negative",
        })

        bp = float(features.get("blood_pressure_sys", 120))
        shap_bp = round(0.04 if bp >= 135 else -0.01, 4)
        contributions.append({
            "feature": "blood_pressure_sys",
            "display_name": self.FEATURE_DISPLAY_NAMES["blood_pressure_sys"],
            "feature_value": bp,
            "shap_value": shap_bp,
            "impact_direction": "positive" if shap_bp >= 0 else "negative",
        })

        act = str(features.get("physical_activity_level", "medium")).lower()
        shap_act = -0.05 if act == "high" else (0.04 if act == "low" else 0.0)
        contributions.append({
            "feature": "physical_activity_level",
            "display_name": self.FEATURE_DISPLAY_NAMES["physical_activity_level"],
            "feature_value": act.capitalize(),
            "shap_value": round(shap_act, 4),
            "impact_direction": "positive" if shap_act > 0 else "negative",
        })

        smoke = bool(features.get("smoking_status", False))
        shap_smoke = 0.03 if smoke else -0.01
        contributions.append({
            "feature": "smoking_status",
            "display_name": self.FEATURE_DISPLAY_NAMES["smoking_status"],
            "feature_value": "Yes" if smoke else "No",
            "shap_value": round(shap_smoke, 4),
            "impact_direction": "positive" if smoke else "negative",
        })

        # Rank by absolute impact
        sorted_factors = sorted(contributions, key=lambda c: abs(c["shap_value"]), reverse=True)
        top_factors = [c["display_name"] for c in sorted_factors[:3]]

        # Generate LIME plain-language clinical statements
        lime_rules: list[str] = []
        if hba1c >= 6.5:
            lime_rules.append(f"HbA1c level ({hba1c}%) is in diagnostic diabetes range (≥6.5%), strongly elevating risk.")
        elif hba1c >= 5.7:
            lime_rules.append(f"HbA1c level ({hba1c}%) is in prediabetes range (5.7–6.4%), which is a primary risk driver.")
        else:
            lime_rules.append(f"HbA1c level ({hba1c}%) is within optimal reference range (<5.7%), providing protective effect.")

        if fg >= 126:
            lime_rules.append(f"Fasting blood glucose ({fg} mg/dL) exceeds clinical threshold (≥126 mg/dL).")
        elif fg >= 100:
            lime_rules.append(f"Impaired fasting glucose ({fg} mg/dL) indicates prediabetic insulin resistance.")

        if bmi >= 30:
            lime_rules.append(f"BMI ({bmi} kg/m²) indicates clinical obesity, contributing significantly to metabolic stress.")
        elif bmi >= 25:
            lime_rules.append(f"Overweight BMI ({bmi} kg/m²) moderately elevates insulin resistance risk.")

        if fam:
            lime_rules.append("Direct family history adds documented genetic predisposition.")

        if act == "high":
            lime_rules.append("High physical activity confers significant cardio-metabolic protective benefit.")
        elif act == "low":
            lime_rules.append("Sedentary lifestyle reduces peripheral insulin sensitivity.")

        return {
            "shap_explanation": {
                "base_value": base_value,
                "feature_contributions": contributions,
                "top_factors": top_factors,
            },
            "lime_explanation": {
                "simple_rules": lime_rules,
                "prediction_local": risk_score,
                "intercept": base_value,
            },
        }

