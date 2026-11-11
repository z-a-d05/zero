"""
ml_pipelines/training/generate_sample_data.py
----------------------------------------------
Generates a realistic synthetic diabetes training dataset with 5,000 samples.

Medical distributions are based on epidemiological literature:
  - Age:              Normal(mean=52, std=15), clipped to [18, 90]
  - BMI:              Right-skewed (log-normal), mean≈28
  - HbA1c:            Diabetics ≈ N(7.8, 0.9), Non-diabetics ≈ N(5.2, 0.4)
  - Fasting glucose:  Diabetics ≈ N(165, 30), Non-diabetics ≈ N(92, 10)
  - Positive rate:    30 % (diabetic)
  - Family history:   35 % positive
  - Smoking:          25 % positive

Usage:
    python generate_sample_data.py --samples 5000 \
                                   --output ml_pipelines/data/synthetic_diabetes_data.csv \
                                   --seed 42
"""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

import numpy as np
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def generate_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    # ------------------------------------------------------------------ #
    # Determine diabetic vs non-diabetic (30 % positive rate)
    # ------------------------------------------------------------------ #
    n_diabetic = int(n_samples * 0.30)
    n_non_diabetic = n_samples - n_diabetic
    diabetes = np.array([1] * n_diabetic + [0] * n_non_diabetic)

    # Shuffle labels (we'll use them to draw feature distributions)
    idx = rng.permutation(n_samples)
    diabetes = diabetes[idx]
    is_diabetic = diabetes == 1

    # ------------------------------------------------------------------ #
    # Age — Normal(52, 15), clipped [18, 90]
    # Diabetics tend to be slightly older
    # ------------------------------------------------------------------ #
    age = np.where(
        is_diabetic,
        rng.normal(loc=56, scale=12, size=n_samples),
        rng.normal(loc=48, scale=14, size=n_samples),
    ).clip(18, 90).astype(int)

    # ------------------------------------------------------------------ #
    # BMI — right-skewed log-normal
    # Diabetics: heavier on average
    # ------------------------------------------------------------------ #
    bmi_diabetic     = np.exp(rng.normal(loc=np.log(31), scale=0.25, size=n_samples))
    bmi_non_diabetic = np.exp(rng.normal(loc=np.log(26), scale=0.25, size=n_samples))
    bmi = np.where(is_diabetic, bmi_diabetic, bmi_non_diabetic).clip(15, 55).round(1)

    # ------------------------------------------------------------------ #
    # Height & Weight (derive from BMI + height)
    # ------------------------------------------------------------------ #
    height_cm = rng.normal(loc=168, scale=10, size=n_samples).clip(145, 200).round(1)
    weight_kg = (bmi * (height_cm / 100) ** 2).round(1)

    # ------------------------------------------------------------------ #
    # HbA1c (%)
    # Diabetics: 6.5–11, Non-diabetics: 4.5–6.4
    # ------------------------------------------------------------------ #
    hba1c_diabetic     = rng.normal(loc=7.8, scale=0.9, size=n_samples).clip(6.5, 14.0)
    hba1c_non_diabetic = rng.normal(loc=5.2, scale=0.4, size=n_samples).clip(4.0,  6.4)
    hba1c = np.where(is_diabetic, hba1c_diabetic, hba1c_non_diabetic).round(2)

    # ------------------------------------------------------------------ #
    # Fasting glucose (mg/dL)
    # ------------------------------------------------------------------ #
    glucose_diabetic     = rng.normal(loc=165, scale=30, size=n_samples).clip(126, 400)
    glucose_non_diabetic = rng.normal(loc=92,  scale=10, size=n_samples).clip(60,  125)
    fasting_glucose = np.where(is_diabetic, glucose_diabetic, glucose_non_diabetic).round(0).astype(int)

    # ------------------------------------------------------------------ #
    # Blood pressure (mmHg)
    # Diabetics: slightly elevated
    # ------------------------------------------------------------------ #
    bp_sys_diabetic     = rng.normal(loc=135, scale=15, size=n_samples).clip(90, 200).round(0).astype(int)
    bp_sys_non_diabetic = rng.normal(loc=122, scale=12, size=n_samples).clip(90, 180).round(0).astype(int)
    blood_pressure_sys = np.where(is_diabetic, bp_sys_diabetic, bp_sys_non_diabetic)

    bp_dia_diabetic     = rng.normal(loc=85, scale=10, size=n_samples).clip(60, 130).round(0).astype(int)
    bp_dia_non_diabetic = rng.normal(loc=78, scale=9,  size=n_samples).clip(60, 120).round(0).astype(int)
    blood_pressure_dia = np.where(is_diabetic, bp_dia_diabetic, bp_dia_non_diabetic)

    # ------------------------------------------------------------------ #
    # Family history — 35 % positive; diabetics more likely
    # ------------------------------------------------------------------ #
    family_history = np.where(
        is_diabetic,
        rng.random(n_samples) < 0.52,  # 52 % among diabetics
        rng.random(n_samples) < 0.26,  # 26 % among non-diabetics
    ).astype(int)

    # ------------------------------------------------------------------ #
    # Physical activity — diabetics tend to be less active
    # ------------------------------------------------------------------ #
    def sample_activity(diabetic_flag: np.ndarray) -> np.ndarray:
        activity = np.empty(n_samples, dtype=object)
        for i in range(n_samples):
            if diabetic_flag[i]:
                activity[i] = rng.choice(["low", "medium", "high"], p=[0.55, 0.30, 0.15])
            else:
                activity[i] = rng.choice(["low", "medium", "high"], p=[0.30, 0.40, 0.30])
        return activity

    physical_activity_level = sample_activity(is_diabetic)

    # ------------------------------------------------------------------ #
    # Smoking — 25 % overall; slightly higher in diabetics
    # ------------------------------------------------------------------ #
    smoking_status = np.where(
        is_diabetic,
        rng.random(n_samples) < 0.30,
        rng.random(n_samples) < 0.22,
    ).astype(int)

    # ------------------------------------------------------------------ #
    # Gender — roughly 50/50
    # ------------------------------------------------------------------ #
    gender = rng.choice(["male", "female"], size=n_samples, p=[0.50, 0.50])

    # ------------------------------------------------------------------ #
    # Introduce ~2 % random missing values in some columns (realistic)
    # ------------------------------------------------------------------ #
    def inject_missing(arr: np.ndarray, rate: float = 0.02) -> np.ndarray:
        arr = arr.astype(object)
        mask = rng.random(n_samples) < rate
        arr[mask] = np.nan
        return arr

    bmi              = inject_missing(bmi.astype(object))
    hba1c            = inject_missing(hba1c.astype(object))
    fasting_glucose  = inject_missing(fasting_glucose.astype(object))
    blood_pressure_sys = inject_missing(blood_pressure_sys.astype(object))

    # ------------------------------------------------------------------ #
    # Assemble DataFrame
    # ------------------------------------------------------------------ #
    df = pd.DataFrame({
        "age":                      age,
        "gender":                   gender,
        "weight_kg":                weight_kg,
        "height_cm":                height_cm,
        "bmi":                      bmi,
        "hba1c":                    hba1c,
        "fasting_glucose":          fasting_glucose,
        "blood_pressure_sys":       blood_pressure_sys,
        "blood_pressure_dia":       blood_pressure_dia,
        "family_history":           family_history,
        "physical_activity_level":  physical_activity_level,
        "smoking_status":           smoking_status,
        "diabetes":                 diabetes,
    })

    logger.info(
        "Generated %d samples | Positive rate: %.1f%% | Missing values: %d cells",
        len(df),
        df["diabetes"].mean() * 100,
        df.isna().sum().sum(),
    )
    return df


def save_dataset(df: pd.DataFrame, output_path: str | Path) -> None:
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info("Dataset saved to %s", output_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate DPIS Synthetic Diabetes Dataset")
    parser.add_argument("--samples", type=int, default=5000)
    parser.add_argument("--output",  default="ml_pipelines/data/synthetic_diabetes_data.csv")
    parser.add_argument("--seed",    type=int, default=42)
    args = parser.parse_args()

    dataset = generate_dataset(n_samples=args.samples, seed=args.seed)
    save_dataset(dataset, args.output)

    # Quick sanity check printout
    print("\n--- Dataset Summary ---")
    print(dataset.describe())
    print("\nClass distribution:")
    print(dataset["diabetes"].value_counts(normalize=True).round(3))
    print("\nMissing values per column:")
    print(dataset.isna().sum())
