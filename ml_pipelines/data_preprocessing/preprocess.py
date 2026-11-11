"""
ml_pipelines/data_preprocessing/preprocess.py
----------------------------------------------
Full preprocessing pipeline for the DPIS diabetes dataset.

Usage:
    python preprocess.py --input data/synthetic_diabetes_data.csv \
                         --output data/preprocessed.csv \
                         --scaler-dir models/

Steps:
    1. Load CSV data
    2. Handle missing values with medically-informed defaults
    3. Feature engineering (BMI category, glucose category, age groups)
    4. Apply SMOTE if minority class < 20 % of dataset
    5. Scale numerical features with StandardScaler
    6. Persist the fitted scaler to models/
    7. Return / save the preprocessed DataFrame
"""

from __future__ import annotations

import argparse
import logging
import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Medical defaults for imputation
# ---------------------------------------------------------------------------
MEDICAL_DEFAULTS: dict[str, float] = {
    "age": 45.0,
    "bmi": 25.0,
    "hba1c": 5.5,
    "fasting_glucose": 95.0,
    "blood_pressure_sys": 120.0,
    "blood_pressure_dia": 80.0,
    "weight_kg": 70.0,
    "height_cm": 170.0,
}

NUMERICAL_FEATURES: list[str] = [
    "age",
    "bmi",
    "hba1c",
    "fasting_glucose",
    "blood_pressure_sys",
    "blood_pressure_dia",
]

CATEGORICAL_FEATURES: list[str] = [
    "gender",
    "physical_activity_level",
]

TARGET_COLUMN = "diabetes"


# ---------------------------------------------------------------------------
# Step 1 — Load
# ---------------------------------------------------------------------------
def load_data(input_path: str | Path) -> pd.DataFrame:
    logger.info("Loading data from %s", input_path)
    df = pd.read_csv(input_path)
    logger.info("Loaded %d rows, %d columns", len(df), len(df.columns))
    return df


# ---------------------------------------------------------------------------
# Step 2 — Impute missing values
# ---------------------------------------------------------------------------
def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    logger.info("Handling missing values …")
    df = df.copy()

    for col, default in MEDICAL_DEFAULTS.items():
        if col in df.columns:
            missing = df[col].isna().sum()
            if missing > 0:
                logger.info("  Imputing %d missing values in '%s' with %.1f", missing, col, default)
                df[col].fillna(default, inplace=True)

    # Boolean / categorical imputation
    for col in ["family_history", "smoking_status"]:
        if col in df.columns:
            df[col].fillna(False, inplace=True)
            df[col] = df[col].astype(int)

    if "gender" in df.columns:
        df["gender"].fillna("other", inplace=True)

    if "physical_activity_level" in df.columns:
        df["physical_activity_level"].fillna("low", inplace=True)

    remaining = df.isna().sum().sum()
    logger.info("Missing values remaining after imputation: %d", remaining)
    return df


# ---------------------------------------------------------------------------
# Step 3 — Feature engineering
# ---------------------------------------------------------------------------
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    logger.info("Engineering features …")
    df = df.copy()

    # BMI category (WHO classification)
    def bmi_category(bmi: float) -> str:
        if bmi < 18.5:
            return "underweight"
        elif bmi < 25.0:
            return "normal"
        elif bmi < 30.0:
            return "overweight"
        else:
            return "obese"

    if "bmi" in df.columns:
        df["bmi_category"] = df["bmi"].apply(bmi_category)

    # Glucose category (mg/dL)
    def glucose_category(g: float) -> str:
        if g < 100:
            return "normal"
        elif g < 126:
            return "prediabetes"
        else:
            return "diabetes_range"

    if "fasting_glucose" in df.columns:
        df["glucose_category"] = df["fasting_glucose"].apply(glucose_category)

    # Age groups
    def age_group(age: float) -> str:
        if age < 30:
            return "young"
        elif age < 50:
            return "middle"
        elif age < 65:
            return "senior"
        else:
            return "elderly"

    if "age" in df.columns:
        df["age_group"] = df["age"].apply(age_group)

    # BMI × HbA1c interaction (useful signal for XGBoost)
    if "bmi" in df.columns and "hba1c" in df.columns:
        df["bmi_hba1c_interaction"] = df["bmi"] * df["hba1c"]

    # Encode ordinal physical activity level
    activity_map = {"low": 0, "medium": 1, "high": 2}
    if "physical_activity_level" in df.columns:
        df["activity_level_encoded"] = df["physical_activity_level"].map(activity_map).fillna(0).astype(int)

    # One-hot encode gender
    if "gender" in df.columns:
        gender_dummies = pd.get_dummies(df["gender"], prefix="gender")
        df = pd.concat([df, gender_dummies], axis=1)

    # One-hot encode categorical engineered features
    for cat_col in ["bmi_category", "glucose_category", "age_group"]:
        if cat_col in df.columns:
            dummies = pd.get_dummies(df[cat_col], prefix=cat_col)
            df = pd.concat([df, dummies], axis=1)

    logger.info("Feature engineering complete. Columns: %d", len(df.columns))
    return df


# ---------------------------------------------------------------------------
# Step 4 — SMOTE for class imbalance
# ---------------------------------------------------------------------------
def apply_smote_if_needed(
    df: pd.DataFrame,
    target_col: str = TARGET_COLUMN,
    minority_threshold: float = 0.20,
) -> pd.DataFrame:
    if target_col not in df.columns:
        logger.warning("Target column '%s' not found. Skipping SMOTE.", target_col)
        return df

    class_counts = df[target_col].value_counts(normalize=True)
    minority_ratio = class_counts.min()
    logger.info("Minority class ratio: %.2f%%", minority_ratio * 100)

    if minority_ratio >= minority_threshold:
        logger.info("Class balance acceptable (>= %.0f%%). SMOTE not applied.", minority_threshold * 100)
        return df

    logger.info("Minority class below %.0f%%. Applying SMOTE …", minority_threshold * 100)
    try:
        from imblearn.over_sampling import SMOTE  # type: ignore
    except ImportError:
        logger.warning("imbalanced-learn not installed. Skipping SMOTE. Install with: pip install imbalanced-learn")
        return df

    # Only use numeric columns for SMOTE
    drop_cols = [target_col] + [c for c in df.columns if df[c].dtype == object]
    X = df.drop(columns=drop_cols)
    y = df[target_col]

    smote = SMOTE(random_state=42, k_neighbors=5)
    X_resampled, y_resampled = smote.fit_resample(X, y)

    df_resampled = pd.DataFrame(X_resampled, columns=X.columns)
    df_resampled[target_col] = y_resampled.values
    logger.info("After SMOTE: %d rows (was %d)", len(df_resampled), len(df))
    return df_resampled


# ---------------------------------------------------------------------------
# Step 5 — Scale numerical features
# ---------------------------------------------------------------------------
def scale_features(
    df: pd.DataFrame,
    scaler_dir: str | Path,
    fit: bool = True,
    scaler_filename: str = "standard_scaler.pkl",
) -> tuple[pd.DataFrame, StandardScaler]:
    logger.info("Scaling numerical features …")
    scaler_dir = Path(scaler_dir)
    scaler_dir.mkdir(parents=True, exist_ok=True)
    scaler_path = scaler_dir / scaler_filename

    # Only scale columns that actually exist in the dataframe
    cols_to_scale = [c for c in NUMERICAL_FEATURES if c in df.columns]

    if fit:
        scaler = StandardScaler()
        df[cols_to_scale] = scaler.fit_transform(df[cols_to_scale])
        with open(scaler_path, "wb") as f:
            pickle.dump(scaler, f)
        logger.info("Scaler fitted and saved to %s", scaler_path)
    else:
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)
        df[cols_to_scale] = scaler.transform(df[cols_to_scale])
        logger.info("Loaded scaler from %s and transformed data", scaler_path)

    return df, scaler


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------
def preprocess(
    input_path: str | Path,
    output_path: str | Path,
    scaler_dir: str | Path = "models/",
    apply_smote: bool = True,
    fit_scaler: bool = True,
) -> pd.DataFrame:
    df = load_data(input_path)
    df = handle_missing_values(df)
    df = engineer_features(df)

    if apply_smote:
        df = apply_smote_if_needed(df, target_col=TARGET_COLUMN)

    df, _ = scale_features(df, scaler_dir=scaler_dir, fit=fit_scaler)

    # Drop raw categorical columns that have been encoded
    cols_to_drop = [c for c in ["gender", "physical_activity_level", "bmi_category",
                                 "glucose_category", "age_group"] if c in df.columns]
    df.drop(columns=cols_to_drop, inplace=True)

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info("Preprocessed data saved to %s (%d rows, %d cols)", output_path, len(df), len(df.columns))
    return df


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DPIS Data Preprocessing Pipeline")
    parser.add_argument("--input",      default="ml_pipelines/data/synthetic_diabetes_data.csv")
    parser.add_argument("--output",     default="ml_pipelines/data/preprocessed.csv")
    parser.add_argument("--scaler-dir", default="ml_pipelines/models/")
    parser.add_argument("--no-smote",   action="store_true", help="Disable SMOTE oversampling")
    args = parser.parse_args()

    preprocess(
        input_path=args.input,
        output_path=args.output,
        scaler_dir=args.scaler_dir,
        apply_smote=not args.no_smote,
    )
