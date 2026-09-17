import os
import joblib
import pandas as pd

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report,
)


# ============================================================
# CONFIGURATION
# ============================================================

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

TARGET = "target"

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

VALIDATION_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "validation.csv",
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "random_forest_baseline.joblib",
)


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("PHASE 7B: RANDOM FOREST EVALUATION")
    print("=" * 60)

    # --------------------------------------------------------
    # Load validation data
    # --------------------------------------------------------

    print("\n===== LOADING VALIDATION DATA =====")

    validation = pd.read_csv(VALIDATION_PATH)

    X_val = validation[FEATURES]
    y_val = validation[TARGET]

    print(f"Validation rows : {len(validation):,}")
    print(f"Features        : {len(FEATURES)}")
    print(f"Positive cases  : {y_val.sum():,}")
    print(f"Negative cases  : {(y_val == 0).sum():,}")

    # --------------------------------------------------------
    # Data checks
    # --------------------------------------------------------

    print("\n===== DATA CHECK =====")

    print(
        f"Missing feature values : "
        f"{X_val.isna().sum().sum()}"
    )

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    print("\nLoading Random Forest model...")

    model = joblib.load(MODEL_PATH)

    print("Model loaded successfully.")

    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    print("\nGenerating validation predictions...")

    y_probability = model.predict_proba(X_val)[:, 1]

    threshold = 0.50

    y_prediction = (
        y_probability >= threshold
    ).astype(int)

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    precision = precision_score(
        y_val,
        y_prediction,
        zero_division=0,
    )

    recall = recall_score(
        y_val,
        y_prediction,
        zero_division=0,
    )

    f1 = f1_score(
        y_val,
        y_prediction,
        zero_division=0,
    )

    roc_auc = roc_auc_score(
        y_val,
        y_probability,
    )

    pr_auc = average_precision_score(
        y_val,
        y_probability,
    )

    cm = confusion_matrix(
        y_val,
        y_prediction,
    )

    # --------------------------------------------------------
    # Results
    # --------------------------------------------------------

    print("\n===== RANDOM FOREST VALIDATION METRICS =====")

    print(f"Threshold : {threshold:.2f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print(f"ROC-AUC   : {roc_auc:.4f}")
    print(f"PR-AUC    : {pr_auc:.4f}")

    # --------------------------------------------------------
    # Confusion Matrix
    # --------------------------------------------------------

    print("\n===== CONFUSION MATRIX =====")

    print(cm)

    print("\nFormat:")
    print("[[TN FP]")
    print(" [FN TP]]")

    # --------------------------------------------------------
    # Classification Report
    # --------------------------------------------------------

    print("\n===== CLASSIFICATION REPORT =====")

    print(
        classification_report(
            y_val,
            y_prediction,
            digits=4,
            zero_division=0,
        )
    )

    # --------------------------------------------------------
    # Probability information
    # --------------------------------------------------------

    print("\n===== PROBABILITY CHECK =====")

    print(
        f"Minimum probability : "
        f"{y_probability.min():.6f}"
    )

    print(
        f"Maximum probability : "
        f"{y_probability.max():.6f}"
    )

    print(
        f"Mean probability    : "
        f"{y_probability.mean():.6f}"
    )

    print("\nPhase 7B completed successfully.")


if __name__ == "__main__":
    main()
