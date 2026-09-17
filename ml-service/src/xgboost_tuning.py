"""Phase 8G: Controlled XGBoost Hyperparameter Tuning.

Tests 3 controlled configurations on train.csv and evaluates on validation.csv:
- Experiment A: Current baseline (n_estimators=300, max_depth=6, lr=0.10)
- Experiment B: Shallower trees (n_estimators=400, max_depth=4, lr=0.08)
- Experiment C: Deeper/slower boosting (n_estimators=400, max_depth=8, lr=0.05)

Records default threshold (0.50) metrics and optimal F1 operating points (0.10 to 0.90).
Never touches test.csv.
"""

import os
from typing import Dict, Any, List
import joblib
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
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

TARGET = "target"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIN_PATH = os.path.join(BASE_DIR, "data", "processed", "train.csv")
VALIDATION_PATH = os.path.join(BASE_DIR, "data", "processed", "validation.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")

EXPERIMENTS: List[Dict[str, Any]] = [
    {
        "name": "Exp A: Baseline",
        "params": {
            "n_estimators": 300,
            "max_depth": 6,
            "learning_rate": 0.10,
        },
        "filename": "xgboost_exp_a_baseline.joblib",
        "description": "Baseline: 300 trees, depth 6, lr 0.10"
    },
    {
        "name": "Exp B: Shallower Trees",
        "params": {
            "n_estimators": 400,
            "max_depth": 4,
            "learning_rate": 0.08,
        },
        "filename": "xgboost_exp_b_shallow.joblib",
        "description": "Regularized: 400 trees, depth 4, lr 0.08"
    },
    {
        "name": "Exp C: Deeper Boosting",
        "params": {
            "n_estimators": 400,
            "max_depth": 8,
            "learning_rate": 0.05,
        },
        "filename": "xgboost_exp_c_deep.joblib",
        "description": "Complex: 400 trees, depth 8, lr 0.05"
    }
]


def evaluate_threshold_sweep(y_val: pd.Series, y_prob: pd.Series) -> Dict[str, Any]:
    """Find threshold in [0.10, 0.90] with highest validation F1."""
    thresholds = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90]
    best_f1 = -1.0
    best_th = 0.50
    best_prec = 0.0
    best_rec = 0.0

    for th in thresholds:
        y_pred = (y_prob >= th).astype(int)
        f1 = f1_score(y_val, y_pred, zero_division=0)
        if f1 > best_f1:
            best_f1 = f1
            best_th = th
            best_prec = precision_score(y_val, y_pred, zero_division=0)
            best_rec = recall_score(y_val, y_pred, zero_division=0)

    return {
        "best_th": best_th,
        "best_f1": best_f1,
        "best_prec": best_prec,
        "best_rec": best_rec
    }


def main():
    print("=" * 80)
    print("PHASE 8G: CONTROLLED XGBOOST HYPERPARAMETER TUNING (VALIDATION ONLY)")
    print("=" * 80)

    train = pd.read_csv(TRAIN_PATH)
    validation = pd.read_csv(VALIDATION_PATH)

    X_train = train[FEATURES]
    y_train = train[TARGET]
    X_val = validation[FEATURES]
    y_val = validation[TARGET]

    print(f"\nTraining samples   : {len(X_train):,} (Positives: {y_train.sum():,})")
    print(f"Validation samples : {len(X_val):,} (Positives: {y_val.sum():,})")
    print(f"Features used      : {len(FEATURES)}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    summary_results = []

    for exp in EXPERIMENTS:
        print(f"\n--- Running {exp['name']} ({exp['description']}) ---")
        model = XGBClassifier(
            **exp["params"],
            objective="binary:logistic",
            eval_metric="logloss",
            random_state=42,
            n_jobs=-1,
            tree_method="hist",
            subsample=1.0,
            colsample_bytree=1.0,
        )

        model.fit(X_train, y_train)

        # Save model
        save_path = os.path.join(MODEL_DIR, exp["filename"])
        joblib.dump(model, save_path)
        print(f"Model saved to: {save_path}")

        # Validation predictions
        y_prob = model.predict_proba(X_val)[:, 1]
        y_pred_default = (y_prob >= 0.50).astype(int)

        # Threshold 0.50 metrics
        prec_50 = precision_score(y_val, y_pred_default, zero_division=0)
        rec_50 = recall_score(y_val, y_pred_default, zero_division=0)
        f1_50 = f1_score(y_val, y_pred_default, zero_division=0)
        roc_auc = roc_auc_score(y_val, y_prob)
        pr_auc = average_precision_score(y_val, y_prob)
        cm_50 = confusion_matrix(y_val, y_pred_default)
        tn, fp = cm_50[0]
        fn, tp = cm_50[1]

        # Threshold sweep
        sweep = evaluate_threshold_sweep(y_val, y_prob)

        summary_results.append({
            "Experiment": exp["name"],
            "Config": f"n={exp['params']['n_estimators']}, d={exp['params']['max_depth']}, lr={exp['params']['learning_rate']}",
            "Prec (0.50)": f"{prec_50*100:.2f}%",
            "Rec (0.50)": f"{rec_50*100:.2f}%",
            "F1 (0.50)": f"{f1_50:.4f}",
            "ROC-AUC": f"{roc_auc:.4f}",
            "PR-AUC": f"{pr_auc:.4f}",
            "TP": tp,
            "FP": fp,
            "FN": fn,
            "Best Th": f"{sweep['best_th']:.2f}",
            "Best F1": f"{sweep['best_f1']:.4f}",
            "Best Rec": f"{sweep['best_rec']*100:.2f}%",
            "Best Prec": f"{sweep['best_prec']*100:.2f}%",
        })

    summary_df = pd.DataFrame(summary_results)

    print("\n" + "=" * 80)
    print("PHASE 8G TUNING COMPARISON TABLE (VALIDATION SET)")
    print("=" * 80)
    print(summary_df.to_string(index=False))

    print("\nPhase 8G tuning completed successfully.")


if __name__ == "__main__":
    main()
