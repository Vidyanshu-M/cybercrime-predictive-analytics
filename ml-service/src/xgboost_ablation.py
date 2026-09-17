"""Phase 8E: Controlled XGBoost Ablation Experiment.

Investigates whether model performance relies disproportionately on
`distance_from_recent_fraud` by retraining on the remaining 20 features
and evaluating on the validation set.

Does not touch test.csv. Does not modify xgboost_baseline.joblib.
"""

import os
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

ALL_FEATURES = [
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

# Ablation feature set: exclude distance_from_recent_fraud
ABLATION_FEATURE = "distance_from_recent_fraud"
ABLATION_FEATURES = [f for f in ALL_FEATURES if f != ABLATION_FEATURE]
TARGET = "target"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRAIN_PATH = os.path.join(BASE_DIR, "data", "processed", "train.csv")
VALIDATION_PATH = os.path.join(BASE_DIR, "data", "processed", "validation.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
BASELINE_MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_baseline.joblib")
ABLATION_MODEL_PATH = os.path.join(MODEL_DIR, "xgboost_ablation_no_distance.joblib")


def main():
    print("=" * 70)
    print("PHASE 8E: XGBOOST ABLATION EXPERIMENT (WITHOUT DISTANCE)")
    print("=" * 70)

    # 1. Load Data
    train = pd.read_csv(TRAIN_PATH)
    validation = pd.read_csv(VALIDATION_PATH)

    X_train_abl = train[ABLATION_FEATURES]
    y_train = train[TARGET]
    X_val_abl = validation[ABLATION_FEATURES]
    y_val = validation[TARGET]

    print(f"\nAblated Feature Set : {len(ABLATION_FEATURES)} features (removed '{ABLATION_FEATURE}')")
    print(f"Training Rows       : {len(X_train_abl):,}")
    print(f"Validation Rows     : {len(X_val_abl):,}")

    # 2. Train Ablation Model
    print("\nTraining Ablation XGBoost model...")
    ablation_model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        subsample=1.0,
        colsample_bytree=1.0,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
        tree_method="hist",
    )
    ablation_model.fit(X_train_abl, y_train)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(ablation_model, ABLATION_MODEL_PATH)
    print(f"Ablation model saved to: {ABLATION_MODEL_PATH}")

    # 3. Evaluate Ablation Model
    y_prob_abl = ablation_model.predict_proba(X_val_abl)[:, 1]
    y_pred_abl = (y_prob_abl >= 0.50).astype(int)

    prec_abl = precision_score(y_val, y_pred_abl, zero_division=0)
    rec_abl = recall_score(y_val, y_pred_abl, zero_division=0)
    f1_abl = f1_score(y_val, y_pred_abl, zero_division=0)
    roc_abl = roc_auc_score(y_val, y_prob_abl)
    pr_abl = average_precision_score(y_val, y_prob_abl)
    cm_abl = confusion_matrix(y_val, y_pred_abl)

    # 4. Load Baseline Full Model for direct comparison
    baseline_model = joblib.load(BASELINE_MODEL_PATH)
    X_val_full = validation[ALL_FEATURES]
    y_prob_full = baseline_model.predict_proba(X_val_full)[:, 1]
    y_pred_full = (y_prob_full >= 0.50).astype(int)

    prec_full = precision_score(y_val, y_pred_full, zero_division=0)
    rec_full = recall_score(y_val, y_pred_full, zero_division=0)
    f1_full = f1_score(y_val, y_pred_full, zero_division=0)
    roc_full = roc_auc_score(y_val, y_prob_full)
    pr_full = average_precision_score(y_val, y_prob_full)
    cm_full = confusion_matrix(y_val, y_pred_full)

    # 5. Summary Table
    comparison = pd.DataFrame([
        {
            "Metric": "Precision",
            "Full Model (21 features)": f"{prec_full:.4f} ({prec_full*100:.2f}%)",
            "Without Distance (20 features)": f"{prec_abl:.4f} ({prec_abl*100:.2f}%)",
            "Difference": f"{(prec_abl - prec_full)*100:+.2f} pp",
        },
        {
            "Metric": "Recall",
            "Full Model (21 features)": f"{rec_full:.4f} ({rec_full*100:.2f}%)",
            "Without Distance (20 features)": f"{rec_abl:.4f} ({rec_abl*100:.2f}%)",
            "Difference": f"{(rec_abl - rec_full)*100:+.2f} pp",
        },
        {
            "Metric": "F1-Score",
            "Full Model (21 features)": f"{f1_full:.4f}",
            "Without Distance (20 features)": f"{f1_abl:.4f}",
            "Difference": f"{f1_abl - f1_full:+.4f}",
        },
        {
            "Metric": "PR-AUC",
            "Full Model (21 features)": f"{pr_full:.4f}",
            "Without Distance (20 features)": f"{pr_abl:.4f}",
            "Difference": f"{pr_abl - pr_full:+.4f}",
        },
        {
            "Metric": "ROC-AUC",
            "Full Model (21 features)": f"{roc_full:.4f}",
            "Without Distance (20 features)": f"{roc_abl:.4f}",
            "Difference": f"{roc_abl - roc_full:+.4f}",
        },
        {
            "Metric": "True Positives (TP)",
            "Full Model (21 features)": f"{cm_full[1, 1]}",
            "Without Distance (20 features)": f"{cm_abl[1, 1]}",
            "Difference": f"{cm_abl[1, 1] - cm_full[1, 1]:+d}",
        },
        {
            "Metric": "False Positives (FP)",
            "Full Model (21 features)": f"{cm_full[0, 1]}",
            "Without Distance (20 features)": f"{cm_abl[0, 1]}",
            "Difference": f"{cm_abl[0, 1] - cm_full[0, 1]:+d}",
        },
        {
            "Metric": "False Negatives (FN)",
            "Full Model (21 features)": f"{cm_full[1, 0]}",
            "Without Distance (20 features)": f"{cm_abl[1, 0]}",
            "Difference": f"{cm_abl[1, 0] - cm_full[1, 0]:+d}",
        },
    ])

    print("\n===== ABLATION COMPARISON TABLE (THRESHOLD = 0.50) =====")
    print(comparison.to_string(index=False))

    # 6. Feature Importances of the Ablated Model
    abl_imp = pd.DataFrame({
        "feature": ABLATION_FEATURES,
        "importance": ablation_model.feature_importances_
    }).sort_values(by="importance", ascending=False).reset_index(drop=True)
    abl_imp["rank"] = abl_imp.index + 1

    print("\n===== TOP 5 FEATURES IN ABLATED MODEL (WITHOUT DISTANCE) =====")
    for _, row in abl_imp.head(5).iterrows():
        print(f"{int(row['rank']):2d}. {row['feature']:<30} {row['importance']:.6f}")

    print("\nPhase 8E ablation experiment completed successfully.")


if __name__ == "__main__":
    main()
