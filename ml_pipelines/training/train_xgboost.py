"""
ml_pipelines/training/train_xgboost.py
----------------------------------------
XGBoost training script for the DPIS diabetes prediction model.

Usage:
    python train_xgboost.py --data ml_pipelines/data/preprocessed.csv \
                             --model-dir ml_pipelines/models/ \
                             --results-dir ml_pipelines/results/

Outputs:
    models/model.pkl              — trained XGBoost model
    models/feature_names.json     — ordered list of feature names
    results/evaluation_results.json — full metrics + cross-val scores
    results/shap_summary.csv      — mean |SHAP| per feature
"""

from __future__ import annotations

import argparse
import json
import logging
import pickle
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    auc,
    confusion_matrix,
    f1_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, train_test_split
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Feature configuration
# ---------------------------------------------------------------------------
CORE_FEATURES = [
    "age",
    "bmi",
    "hba1c",
    "fasting_glucose",
    "blood_pressure_sys",
    "family_history",
    "activity_level_encoded",
    "smoking_status",
]

TARGET = "diabetes"

XGBOOST_PARAMS: dict = {
    "n_estimators": 200,
    "max_depth": 6,
    "learning_rate": 0.1,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 1,
    "gamma": 0,
    "reg_alpha": 0.1,
    "reg_lambda": 1.0,
    "eval_metric": "auc",
    "use_label_encoder": False,
    "random_state": 42,
    "n_jobs": -1,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict:
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    sensitivity = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    return {
        "auc": float(roc_auc_score(y_true, y_prob)),
        "f1": float(f1_score(y_true, y_pred)),
        "sensitivity": float(sensitivity),
        "specificity": float(specificity),
        "confusion_matrix": cm.tolist(),
    }


def cross_validate(
    X: pd.DataFrame, y: pd.Series, params: dict, n_splits: int = 5
) -> dict:
    logger.info("Running %d-fold stratified cross-validation …", n_splits)
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    fold_metrics: list[dict] = []

    for fold, (train_idx, val_idx) in enumerate(skf.split(X, y), start=1):
        X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]

        model = XGBClassifier(**params)
        model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)

        y_prob = model.predict_proba(X_val)[:, 1]
        y_pred = (y_prob >= 0.5).astype(int)
        metrics = compute_metrics(y_val.values, y_pred, y_prob)
        fold_metrics.append(metrics)
        logger.info(
            "  Fold %d — AUC: %.4f | F1: %.4f | Sens: %.4f | Spec: %.4f",
            fold, metrics["auc"], metrics["f1"], metrics["sensitivity"], metrics["specificity"],
        )

    agg: dict = {}
    for key in ["auc", "f1", "sensitivity", "specificity"]:
        vals = [m[key] for m in fold_metrics]
        agg[key] = {"mean": float(np.mean(vals)), "std": float(np.std(vals)), "folds": vals}

    logger.info(
        "CV summary — AUC: %.4f±%.4f | F1: %.4f±%.4f",
        agg["auc"]["mean"], agg["auc"]["std"],
        agg["f1"]["mean"],  agg["f1"]["std"],
    )
    return agg


def generate_shap_values(model: XGBClassifier, X: pd.DataFrame) -> pd.DataFrame:
    try:
        import shap  # type: ignore
    except ImportError:
        logger.warning("shap not installed. Skipping SHAP explanation. Install with: pip install shap")
        return pd.DataFrame()

    logger.info("Computing SHAP values …")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    shap_df = pd.DataFrame(
        {"feature": X.columns.tolist(), "mean_abs_shap": np.abs(shap_values).mean(axis=0)}
    ).sort_values("mean_abs_shap", ascending=False)
    return shap_df


# ---------------------------------------------------------------------------
# Main training function
# ---------------------------------------------------------------------------
def train(
    data_path: str | Path,
    model_dir: str | Path = "ml_pipelines/models/",
    results_dir: str | Path = "ml_pipelines/results/",
    test_size: float = 0.2,
) -> None:
    model_dir = Path(model_dir)
    results_dir = Path(results_dir)
    model_dir.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)

    # --- Load data ---
    logger.info("Loading preprocessed data from %s", data_path)
    df = pd.read_csv(data_path)

    # Use only core features that are present
    features = [f for f in CORE_FEATURES if f in df.columns]
    missing_features = [f for f in CORE_FEATURES if f not in df.columns]
    if missing_features:
        logger.warning("Missing features (will be ignored): %s", missing_features)

    if TARGET not in df.columns:
        raise ValueError(f"Target column '{TARGET}' not found in dataset.")

    X = df[features]
    y = df[TARGET].astype(int)
    logger.info("Dataset: %d samples | %d features | %.1f%% positive", len(X), len(features), y.mean() * 100)

    # --- Train/test split ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )
    logger.info("Train: %d | Test: %d", len(X_train), len(X_test))

    # --- Cross-validation ---
    cv_results = cross_validate(X_train, y_train, XGBOOST_PARAMS)

    # --- Final model on full training set ---
    logger.info("Training final XGBoost model on full training split …")
    final_model = XGBClassifier(**XGBOOST_PARAMS)
    final_model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=50,
    )

    # --- Evaluate on held-out test set ---
    y_prob_test = final_model.predict_proba(X_test)[:, 1]
    y_pred_test = (y_prob_test >= 0.5).astype(int)
    test_metrics = compute_metrics(y_test.values, y_pred_test, y_prob_test)
    logger.info(
        "Test set — AUC: %.4f | F1: %.4f | Sensitivity: %.4f | Specificity: %.4f",
        test_metrics["auc"], test_metrics["f1"],
        test_metrics["sensitivity"], test_metrics["specificity"],
    )

    # --- SHAP values ---
    shap_df = generate_shap_values(final_model, X_test)
    if not shap_df.empty:
        shap_path = results_dir / "shap_summary.csv"
        shap_df.to_csv(shap_path, index=False)
        logger.info("SHAP summary saved to %s", shap_path)

    # --- Save model ---
    model_path = model_dir / "model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(final_model, f)
    logger.info("Model saved to %s", model_path)

    # --- Save feature names ---
    feature_names_path = model_dir / "feature_names.json"
    with open(feature_names_path, "w") as f:
        json.dump(features, f, indent=2)
    logger.info("Feature names saved to %s", feature_names_path)

    # --- Save evaluation results ---
    evaluation = {
        "model": "XGBoost",
        "version": "1.0.0",
        "features": features,
        "hyperparameters": XGBOOST_PARAMS,
        "cross_validation": cv_results,
        "test_set_metrics": test_metrics,
        "dataset_info": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "positive_rate": float(y.mean()),
        },
        "shap_top_features": shap_df.head(5).to_dict(orient="records") if not shap_df.empty else [],
    }
    results_path = results_dir / "evaluation_results.json"
    with open(results_path, "w") as f:
        json.dump(evaluation, f, indent=2)
    logger.info("Evaluation results saved to %s", results_path)
    logger.info("Training complete.")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train DPIS XGBoost Diabetes Prediction Model")
    parser.add_argument("--data",        default="ml_pipelines/data/preprocessed.csv")
    parser.add_argument("--model-dir",   default="ml_pipelines/models/")
    parser.add_argument("--results-dir", default="ml_pipelines/results/")
    parser.add_argument("--test-size",   type=float, default=0.2)
    args = parser.parse_args()

    train(
        data_path=args.data,
        model_dir=args.model_dir,
        results_dir=args.results_dir,
        test_size=args.test_size,
    )
