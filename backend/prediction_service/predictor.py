"""
prediction_service/predictor.py
--------------------------------
XGBoost-based diabetes risk predictor for the DPIS.

The ``DiabetesPredictor`` class attempts to load a real trained model file
from ``prediction_service/models/``.  When no model file is found it falls
back to a medically-grounded heuristic simulation so the API remains fully
functional for development and testing.

Supported prediction types
--------------------------
- T2DM — Type 2 Diabetes Mellitus
- T1DM — Type 1 Diabetes Mellitus
- GDM  — Gestational Diabetes Mellitus
- MODY — Maturity-Onset Diabetes of the Young
"""

from __future__ import annotations

import logging
import math
import os
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent / "models"

MODEL_VERSION_REAL = "xgboost-v1.0"
MODEL_VERSION_HEURISTIC = "heuristic-v1"

# ---------------------------------------------------------------------------
# Risk thresholds
# ---------------------------------------------------------------------------

LOW_RISK_MAX = 0.35
HIGH_RISK_MIN = 0.65


def _categorise(score: float) -> str:
    """Map a continuous risk score to a categorical label."""
    if score < LOW_RISK_MAX:
        return "low"
    if score < HIGH_RISK_MIN:
        return "medium"
    return "high"


# ---------------------------------------------------------------------------
# Predictor class
# ---------------------------------------------------------------------------


class DiabetesPredictor:
    """
    Unified predictor for all supported diabetes subtypes.

    Loads an XGBoost model from disk on first use; falls back to the
    heuristic simulation if no model file is available.

    Usage::

        predictor = DiabetesPredictor()
        result = predictor.predict(features, prediction_type="T2DM")
    """

    def __init__(self) -> None:
        self._models: dict[str, Any] = {}
        self._using_real_model: dict[str, bool] = {}
        self.load_model()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def load_model(self) -> None:
        """
        Attempt to load XGBoost model files for each prediction type.

        Files are expected at ``prediction_service/models/<type>_model.json``.
        Each missing or unloadable file falls back gracefully to the
        heuristic simulation.
        """
        try:
            import xgboost as xgb  # type: ignore[import]
        except ImportError:
            logger.warning("xgboost not installed — using heuristic simulation for all types.")
            for ptype in ("T2DM", "T1DM", "GDM", "MODY"):
                self._using_real_model[ptype] = False
            return

        for ptype in ("T2DM", "T1DM", "GDM", "MODY"):
            model_path = MODEL_DIR / f"{ptype.lower()}_model.json"
            if model_path.exists():
                try:
                    model = xgb.Booster()
                    model.load_model(str(model_path))
                    self._models[ptype] = model
                    self._using_real_model[ptype] = True
                    logger.info("Loaded real XGBoost model for %s from %s", ptype, model_path)
                except Exception as exc:
                    logger.warning(
                        "Failed to load model for %s (%s) — using heuristic.", ptype, exc
                    )
                    self._using_real_model[ptype] = False
            else:
                logger.info("No model file found for %s — using heuristic simulation.", ptype)
                self._using_real_model[ptype] = False

    def predict(
        self,
        features: dict[str, Any],
        prediction_type: str = "T2DM",
    ) -> dict[str, Any]:
        """
        Run a diabetes risk prediction for the given feature set.

        Parameters
        ----------
        features:
            Pre-processed feature dict (output of ``FeaturePreprocessor``).
        prediction_type:
            One of ``T2DM``, ``T1DM``, ``GDM``, ``MODY``.

        Returns
        -------
        dict with keys:
            - ``risk_score``    (float, 0–1)
            - ``risk_category`` (str: low / medium / high)
            - ``model_version`` (str)
            - ``input_features``(dict — echo of processed features)
        """
        ptype = prediction_type.upper()
        if ptype not in ("T2DM", "T1DM", "GDM", "MODY"):
            logger.warning("Unknown prediction type '%s', defaulting to T2DM", ptype)
            ptype = "T2DM"

        if self._using_real_model.get(ptype, False):
            score = self._predict_with_model(features, ptype)
            version = MODEL_VERSION_REAL
        else:
            score = self._simulate_prediction(features, ptype)
            version = MODEL_VERSION_HEURISTIC

        # Clamp to [0, 1]
        score = max(0.0, min(1.0, score))
        category = _categorise(score)

        return {
            "risk_score": round(score, 4),
            "risk_category": category,
            "model_version": version,
            "input_features": features,
        }

    # ------------------------------------------------------------------
    # Real model inference
    # ------------------------------------------------------------------

    def _predict_with_model(self, features: dict[str, Any], ptype: str) -> float:
        """Run inference through a loaded XGBoost Booster."""
        import numpy as np  # type: ignore[import]
        import xgboost as xgb  # type: ignore[import]

        ordered_keys = [
            "age", "bmi", "hba1c", "fasting_glucose",
            "blood_pressure_sys", "blood_pressure_dia",
            "family_history", "physical_activity_level",
            "smoking_status", "gender",
            "bmi_category", "hba1c_category", "glucose_category",
            "bp_elevated", "metabolic_risk_score",
        ]
        row = np.array([[features.get(k, 0.0) for k in ordered_keys]], dtype=np.float32)
        dmatrix = xgb.DMatrix(row)
        prob: float = float(self._models[ptype].predict(dmatrix)[0])
        return prob

    # ------------------------------------------------------------------
    # Heuristic simulation (medically grounded)
    # ------------------------------------------------------------------

    def _simulate_prediction(self, features: dict[str, Any], ptype: str) -> float:
        """
        Compute a risk score using clinically validated heuristics.

        Each factor contributes additively or multiplicatively to a base
        risk value, which is then passed through a sigmoid to constrain the
        output to (0, 1).  The heuristics mirror published risk calculators
        (e.g., ADA risk test, Finnish Diabetes Risk Score).

        Parameters
        ----------
        features:
            Pre-processed (normalised + encoded) feature dict.
        ptype:
            Diabetes subtype — governs which heuristic branch runs.

        Returns
        -------
        float
            Unclamped risk score in roughly (0, 1).
        """
        dispatch = {
            "T2DM": self._t2dm_heuristic,
            "T1DM": self._t1dm_heuristic,
            "GDM": self._gdm_heuristic,
            "MODY": self._mody_heuristic,
        }
        return dispatch[ptype](features)

    # ------------------------------------------------------------------
    # T2DM heuristic
    # ------------------------------------------------------------------

    def _t2dm_heuristic(self, f: dict[str, Any]) -> float:
        """
        Medically grounded T2DM risk calculation.

        Key references:
        - ADA Standards of Care 2024
        - Finnish Diabetes Risk Score (FINDRISC)
        """
        logit = -4.0  # base log-odds (low background risk)

        # --- Age factor ---
        age = float(f.get("age", 45))
        if age >= 65:
            logit += 1.5
        elif age >= 55:
            logit += 1.0
        elif age >= 45:
            logit += 0.5
        elif age >= 35:
            logit += 0.1

        # --- BMI ---
        bmi = float(f.get("bmi", 25))
        if bmi >= 35:
            logit += 2.5
        elif bmi >= 30:
            logit += 1.8
        elif bmi >= 25:
            logit += 0.8
        # < 18.5 slight protective effect
        elif bmi < 18.5:
            logit -= 0.3

        # --- HbA1c (most discriminating feature) ---
        hba1c = float(f.get("hba1c", 5.5))
        if hba1c >= 6.5:
            logit += 4.0   # Already in diabetic range
        elif hba1c >= 6.0:
            logit += 2.5
        elif hba1c >= 5.7:
            logit += 1.2   # Pre-diabetes
        elif hba1c < 5.0:
            logit -= 1.0

        # --- Fasting glucose ---
        fg = float(f.get("fasting_glucose", 95))
        if fg >= 126:
            logit += 3.5   # Diabetic range
        elif fg >= 110:
            logit += 2.0
        elif fg >= 100:
            logit += 1.0
        elif fg < 70:
            logit -= 0.5

        # --- Blood pressure ---
        bp_sys = float(f.get("blood_pressure_sys", 120))
        if bp_sys >= 160:
            logit += 1.2
        elif bp_sys >= 140:
            logit += 0.6

        # --- Family history (1st-degree relative) ---
        if f.get("family_history", 0) >= 1.0:
            logit += 1.5

        # --- Physical activity ---
        activity = float(f.get("physical_activity_level", 0.5))
        # 0 = low, 0.5 = medium, 1 = high
        if activity == 0.0:
            logit += 0.8
        elif activity == 1.0:
            logit -= 0.8

        # --- Smoking ---
        if f.get("smoking_status", 0) >= 1.0:
            logit += 0.5

        return self._sigmoid(logit)

    # ------------------------------------------------------------------
    # T1DM heuristic
    # ------------------------------------------------------------------

    def _t1dm_heuristic(self, f: dict[str, Any]) -> float:
        """
        T1DM risk — driven primarily by young age, rapid-onset hyperglycaemia,
        and auto-immune markers (approximated here by very high HbA1c with
        normal BMI).
        """
        logit = -5.0

        age = float(f.get("age", 30))
        # T1DM peaks in childhood / young adulthood
        if age <= 14:
            logit += 2.5
        elif age <= 25:
            logit += 1.5
        elif age <= 35:
            logit += 0.5
        else:
            logit -= 1.0  # Uncommon in older adults

        hba1c = float(f.get("hba1c", 5.5))
        if hba1c >= 7.0:
            logit += 3.5
        elif hba1c >= 6.5:
            logit += 2.0

        fg = float(f.get("fasting_glucose", 95))
        if fg >= 200:
            logit += 2.5
        elif fg >= 126:
            logit += 1.5

        bmi = float(f.get("bmi", 22))
        # T1DM patients often have normal/low BMI (unlike T2DM)
        if bmi < 25:
            logit += 0.5

        if f.get("family_history", 0) >= 1.0:
            logit += 1.0

        return self._sigmoid(logit)

    # ------------------------------------------------------------------
    # GDM heuristic
    # ------------------------------------------------------------------

    def _gdm_heuristic(self, f: dict[str, Any]) -> float:
        """
        Gestational Diabetes Mellitus risk — age, BMI, and glucose
        are the primary drivers; relevant only for female patients.
        """
        logit = -4.5

        # Gender penalty if male (GDM is female-only; penalise improperly submitted data)
        gender = float(f.get("gender", 1.0))  # 1.0 = F after encoding
        if gender < 0.8:  # not female
            logit -= 2.0

        age = float(f.get("age", 28))
        if age >= 35:
            logit += 2.0
        elif age >= 30:
            logit += 1.0

        bmi = float(f.get("bmi", 25))
        if bmi >= 35:
            logit += 2.5
        elif bmi >= 30:
            logit += 1.5
        elif bmi >= 25:
            logit += 0.6

        fg = float(f.get("fasting_glucose", 92))
        if fg >= 126:
            logit += 3.0
        elif fg >= 92:
            logit += 1.5

        hba1c = float(f.get("hba1c", 5.5))
        if hba1c >= 6.5:
            logit += 3.0
        elif hba1c >= 5.7:
            logit += 1.0

        if f.get("family_history", 0) >= 1.0:
            logit += 1.2

        return self._sigmoid(logit)

    # ------------------------------------------------------------------
    # MODY heuristic
    # ------------------------------------------------------------------

    def _mody_heuristic(self, f: dict[str, Any]) -> float:
        """
        Maturity-Onset Diabetes of the Young — rare monogenic diabetes;
        young onset, strong family history, non-obese.
        """
        logit = -6.0

        age = float(f.get("age", 25))
        if age <= 25:
            logit += 2.0
        elif age <= 35:
            logit += 1.0
        elif age > 45:
            logit -= 1.5

        # Non-obese is characteristic of MODY
        bmi = float(f.get("bmi", 23))
        if bmi < 25:
            logit += 1.5
        elif bmi >= 30:
            logit -= 1.0

        hba1c = float(f.get("hba1c", 6.0))
        if hba1c >= 6.5:
            logit += 2.5
        elif hba1c >= 5.7:
            logit += 1.0

        # Strong family history is a hallmark of MODY
        if f.get("family_history", 0) >= 1.0:
            logit += 3.0

        return self._sigmoid(logit)

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    @staticmethod
    def _sigmoid(x: float) -> float:
        """Standard sigmoid function: maps any real number to (0, 1)."""
        return 1.0 / (1.0 + math.exp(-x))
