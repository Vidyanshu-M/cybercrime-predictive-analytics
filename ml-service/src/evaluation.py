"""Phase 6B: Model Evaluation Module.

Evaluates model predictions on validation or test sets using the metrics specified in the blueprint:
- Precision (mitigating alert fatigue)
- Recall (catching active fraud bursts)
- F1-Score (harmonic balance)
- ROC-AUC (discriminative ability across thresholds)
- PR-AUC / Average Precision (critical metric for imbalanced fraud events)
- Confusion Matrix & Detailed Classification Report
"""

import os
from typing import Dict, Any, Optional
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report,
)

FEATURES = [
    "hour",
    "day_of_week",
    "is_weekend",
    "complaints_last_1h",
    "complaints_last_6h",
    "complaints_last_24h",
    "withdrawals_last_1h",
    "withdrawals_last_6h",
    "withdrawals_last_24h",
    "withdrawal_count",
    "total_withdrawal_amount",
    "average_withdrawal",
    "unique_accounts",
    "transaction_velocity",
    "complaints_1km",
    "complaints_3km",
    "fraud_events_1km",
    "fraud_events_3km",
    "distance_from_recent_fraud",
    "historical_fraud_count",
    "historical_hotspot_score",
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

VALIDATION_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "validation.csv",
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "logistic_regression_baseline.joblib",
)


def evaluate_predictions(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_proba: Optional[np.ndarray] = None,
    pos_label: int = 1
) -> Dict[str, Any]:
    """Helper function to calculate dictionary of standard evaluation metrics."""
    y_true_arr = np.asarray(y_true)
    y_pred_arr = np.asarray(y_pred)

    precision = float(precision_score(y_true_arr, y_pred_arr, pos_label=pos_label, zero_division=0))
    recall = float(recall_score(y_true_arr, y_pred_arr, pos_label=pos_label, zero_division=0))
    f1 = float(f1_score(y_true_arr, y_pred_arr, pos_label=pos_label, zero_division=0))
    accuracy = float(accuracy_score(y_true_arr, y_pred_arr))

    metrics: Dict[str, Any] = {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "accuracy": accuracy,
        "confusion_matrix": confusion_matrix(y_true_arr, y_pred_arr).tolist(),
    }

    if y_proba is not None:
        proba_arr = np.asarray(y_proba)
        if proba_arr.ndim == 2 and proba_arr.shape[1] > 1:
            pos_proba = proba_arr[:, pos_label]
        else:
            pos_proba = proba_arr.ravel()

        metrics["roc_auc"] = float(roc_auc_score(y_true_arr, pos_proba))
        metrics["pr_auc"] = float(average_precision_score(y_true_arr, pos_proba))
    else:
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None

    return metrics


def main():
    print("=" * 60)
    print("PHASE 6B: LOGISTIC REGRESSION EVALUATION")
    print("=" * 60)

    # ---------------------------------------------------------
    # Load validation data
    # ---------------------------------------------------------
    validation = pd.read_csv(VALIDATION_PATH)

    X_val = validation[FEATURES]
    y_val = validation["target"]

    print("\n===== DATA CHECK =====")
    print(f"Validation rows: {len(validation):,}")
    print(f"Number of features: {len(FEATURES)}")
    print(f"Validation positives: {y_val.sum():,}")
    print(f"Validation negatives: {(y_val == 0).sum():,}")

    # ---------------------------------------------------------
    # Load trained model
    # ---------------------------------------------------------
    print("\nLoading trained Logistic Regression model...")
    model = joblib.load(MODEL_PATH)

    # ---------------------------------------------------------
    # Predictions (Baseline Threshold = 0.50)
    # ---------------------------------------------------------
    y_probability = model.predict_proba(X_val)[:, 1]
    y_prediction = (y_probability >= 0.50).astype(int)

    # ---------------------------------------------------------
    # Metrics
    # ---------------------------------------------------------
    precision = precision_score(y_val, y_prediction, zero_division=0)
    recall = recall_score(y_val, y_prediction, zero_division=0)
    f1 = f1_score(y_val, y_prediction, zero_division=0)
    roc_auc = roc_auc_score(y_val, y_probability)
    pr_auc = average_precision_score(y_val, y_probability)
    cm = confusion_matrix(y_val, y_prediction)

    # ---------------------------------------------------------
    # Output
    # ---------------------------------------------------------
    print("\n===== VALIDATION METRICS =====")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print(f"ROC-AUC   : {roc_auc:.4f}")
    print(f"PR-AUC    : {pr_auc:.4f}")

    print("\n===== CONFUSION MATRIX =====")
    print(cm)
    print("\nFormat:")
    print("[[TN FP]")
    print(" [FN TP]]")

    print("\n===== CLASSIFICATION REPORT =====")
    print(
        classification_report(
            y_val,
            y_prediction,
            digits=4,
            zero_division=0,
        )
    )

    print("\nEvaluation completed successfully.")


if __name__ == "__main__":
    main()
