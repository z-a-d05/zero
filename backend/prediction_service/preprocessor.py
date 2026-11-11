"""
prediction_service/preprocessor.py
-----------------------------------
Feature engineering and normalisation for the DPIS prediction pipeline.

The ``FeaturePreprocessor`` class accepts a raw patient feature dict and
returns a cleaned, normalised, encoded dict suitable for the XGBoost model.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Medical reference ranges used for normalisation
# ---------------------------------------------------------------------------

BMI_NORMAL_MIN: float = 18.5
BMI_NORMAL_MAX: float = 24.9
BMI_OVERWEIGHT_MAX: float = 29.9

HBA1C_NORMAL_MAX: float = 5.6     # % — below this is normal
HBA1C_PREDIABETES_MAX: float = 6.4  # % — 5.7–6.4 is pre-diabetes
# > 6.5 % → diabetic range

FASTING_GLUCOSE_NORMAL_MAX: float = 99.0    # mg/dL
FASTING_GLUCOSE_PREDIABETES_MAX: float = 125.0  # mg/dL

BP_SYS_NORMAL_MAX: float = 120.0  # mmHg
BP_DIA_NORMAL_MAX: float = 80.0   # mmHg

# Default imputation values (population-median estimates)
DEFAULTS: dict[str, float | str | bool] = {
    "age": 45.0,
    "bmi": 27.0,
    "hba1c": 5.5,
    "fasting_glucose": 95.0,
    "blood_pressure_sys": 120.0,
    "blood_pressure_dia": 80.0,
    "family_history": False,
    "physical_activity_level": "medium",
    "smoking_status": False,
    "gender": "M",
}

ACTIVITY_ENCODING: dict[str, float] = {
    "low": 0.0,
    "medium": 0.5,
    "high": 1.0,
}

GENDER_ENCODING: dict[str, float] = {
    "M": 0.0,
    "F": 1.0,
    "Other": 0.5,
}


class FeaturePreprocessor:
    """
    Cleans, imputes, and normalises raw patient features.

    Usage::

        preprocessor = FeaturePreprocessor()
        processed = preprocessor.process(raw_features)
    """

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def process(self, raw: dict) -> dict[str, float]:
        """
        Process raw patient feature dict into a normalised, model-ready dict.

        Steps:
        1. Impute missing values with medical defaults.
        2. Clamp values to physiologically plausible ranges.
        3. Encode categorical variables as floats.
        4. Add derived features (BMI category, glucose category, etc.).

        Parameters
        ----------
        raw:
            Dict with any subset of the expected feature keys.

        Returns
        -------
        dict[str, float]
            Fully populated, normalised feature dict.
        """
        features = self._impute_missing(raw)
        features = self._clamp_values(features)
        processed = self._encode_categoricals(features)
        processed = self._add_derived_features(processed)
        logger.debug("Preprocessed features: %s", processed)
        return processed

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _impute_missing(self, raw: dict) -> dict:
        """Fill absent keys with medically sensible default values."""
        result: dict = {}
        for key, default in DEFAULTS.items():
            value = raw.get(key)
            if value is None:
                logger.info("Imputing missing feature '%s' with default %s", key, default)
                result[key] = default
            else:
                result[key] = value
        return result

    def _clamp_values(self, features: dict) -> dict:
        """Clamp numeric features to physiologically valid ranges."""
        clamp_rules: dict[str, tuple[float, float]] = {
            "age": (0.0, 130.0),
            "bmi": (10.0, 80.0),
            "hba1c": (3.0, 20.0),
            "fasting_glucose": (50.0, 600.0),
            "blood_pressure_sys": (60.0, 250.0),
            "blood_pressure_dia": (40.0, 150.0),
        }
        result = dict(features)
        for field, (lo, hi) in clamp_rules.items():
            if field in result and isinstance(result[field], (int, float)):
                clamped = max(lo, min(hi, float(result[field])))
                if clamped != result[field]:
                    logger.warning(
                        "Feature '%s' value %s clamped to %s", field, result[field], clamped
                    )
                result[field] = clamped
        return result

    def _encode_categoricals(self, features: dict) -> dict[str, float]:
        """Encode string/bool features as floats for the model."""
        result: dict[str, float] = {}

        # Numeric pass-through
        for key in ("age", "bmi", "hba1c", "fasting_glucose",
                    "blood_pressure_sys", "blood_pressure_dia"):
            result[key] = float(features.get(key, 0.0))

        # Boolean features
        result["family_history"] = 1.0 if features.get("family_history") else 0.0
        result["smoking_status"] = 1.0 if features.get("smoking_status") else 0.0

        # Physical activity level
        activity_raw = str(features.get("physical_activity_level", "medium")).lower()
        result["physical_activity_level"] = ACTIVITY_ENCODING.get(activity_raw, 0.5)

        # Gender
        gender_raw = str(features.get("gender", "M"))
        result["gender"] = GENDER_ENCODING.get(gender_raw, 0.0)

        return result

    def _add_derived_features(self, features: dict[str, float]) -> dict[str, float]:
        """
        Compute domain-derived features that improve model performance.

        Derived features
        ----------------
        - ``bmi_category``        : 0 (underweight/normal), 1 (overweight), 2 (obese)
        - ``hba1c_category``      : 0 (normal), 1 (pre-diabetes), 2 (diabetic range)
        - ``glucose_category``    : 0 (normal), 1 (impaired), 2 (diabetic range)
        - ``bp_elevated``         : 1 if either BP reading is elevated
        - ``metabolic_risk_score``: composite score from BMI + glucose + HbA1c
        """
        result = dict(features)

        bmi = features["bmi"]
        if bmi < BMI_NORMAL_MIN:
            result["bmi_category"] = 0.0
        elif bmi <= BMI_NORMAL_MAX:
            result["bmi_category"] = 0.0
        elif bmi <= BMI_OVERWEIGHT_MAX:
            result["bmi_category"] = 1.0
        else:
            result["bmi_category"] = 2.0

        hba1c = features["hba1c"]
        if hba1c <= HBA1C_NORMAL_MAX:
            result["hba1c_category"] = 0.0
        elif hba1c <= HBA1C_PREDIABETES_MAX:
            result["hba1c_category"] = 1.0
        else:
            result["hba1c_category"] = 2.0

        fg = features["fasting_glucose"]
        if fg <= FASTING_GLUCOSE_NORMAL_MAX:
            result["glucose_category"] = 0.0
        elif fg <= FASTING_GLUCOSE_PREDIABETES_MAX:
            result["glucose_category"] = 1.0
        else:
            result["glucose_category"] = 2.0

        result["bp_elevated"] = (
            1.0
            if features["blood_pressure_sys"] > BP_SYS_NORMAL_MAX
            or features["blood_pressure_dia"] > BP_DIA_NORMAL_MAX
            else 0.0
        )

        # Simple additive composite (0–6 scale, normalised to 0–1)
        composite = (
            result["bmi_category"]
            + result["hba1c_category"]
            + result["glucose_category"]
            + result["bp_elevated"]
            + result["family_history"]
            + result["smoking_status"]
        )
        result["metabolic_risk_score"] = round(min(composite / 6.0, 1.0), 4)

        return result
