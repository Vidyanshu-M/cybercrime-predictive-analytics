"""Phase 6C: Validation Probability Threshold Analysis.

Evaluates trade-offs across classification thresholds (0.10 to 0.90)
using the trained Logistic Regression baseline on validation data.
Does not touch test.csv.
"""

import os
from typing import List, Dict, Any
import joblib
import pandas as pd
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
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


def run_threshold_analysis():
    print("=" * 75)
    print("PHASE 6C: LOGISTIC REGRESSION THRESHOLD ANALYSIS (VALIDATION SET)")
    print("=" * 75)

    validation = pd.read_csv(VALIDATION_PATH)
    X_val = validation[FEATURES]
    y_val = validation["target"]

    print(f"\nValidation samples : {len(validation):,}")
    print(f"Positive cases     : {y_val.sum():,} ({y_val.mean()*100:.2f}%)")
    print(f"Negative cases     : {(y_val == 0).sum():,} ({(1 - y_val.mean())*100:.2f}%)")

    model = joblib.load(MODEL_PATH)
    y_prob = model.predict_proba(X_val)[:, 1]

    thresholds = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]
    records = []

    for th in thresholds:
        y_pred = (y_prob >= th).astype(int)

        prec = precision_score(y_val, y_pred, zero_division=0)
        rec = recall_score(y_val, y_pred, zero_division=0)
        f1 = f1_score(y_val, y_pred, zero_division=0)
        cm = confusion_matrix(y_val, y_pred)

        tn, fp = cm[0]
        fn, tp = cm[1]

        records.append({
            "Threshold": th,
            "Precision": prec,
            "Recall": rec,
            "F1": f1,
            "TP": tp,
            "FP": fp,
            "TN": tn,
            "FN": fn
        })

    results_df = pd.DataFrame(records)

    print("\n===== THRESHOLD PERFORMANCE TRADE-OFF TABLE =====")
    print(
        results_df.to_string(
            index=False,
            formatters={
                "Threshold": "{:.2f}".format,
                "Precision": "{:.4f}".format,
                "Recall": "{:.4f}".format,
                "F1": "{:.4f}".format,
                "TP": "{:,}".format,
                "FP": "{:,}".format,
                "TN": "{:,}".format,
                "FN": "{:,}".format,
            }
        )
    )

    print("\n" + "=" * 75)
    print("ANALYSIS SUMMARY")
    print("=" * 75)
    best_f1_idx = results_df["F1"].idxmax()
    best_f1_row = results_df.iloc[best_f1_idx]
    print(
        f"Maximum F1-Score: {best_f1_row['F1']:.4f} achieved at Threshold {best_f1_row['Threshold']:.2f} "
        f"(Precision: {best_f1_row['Precision']:.4f}, Recall: {best_f1_row['Recall']:.4f}, "
        f"TP: {int(best_f1_row['TP'])}, FP: {int(best_f1_row['FP'])})"
    )


if __name__ == "__main__":
    run_threshold_analysis()
