import os
import joblib
import pandas as pd

from xgboost import XGBClassifier


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

TRAIN_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "train.csv",
)

VALIDATION_PATH = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "validation.csv",
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models",
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "xgboost_baseline.joblib",
)


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("PHASE 8B: XGBOOST PRIMARY BASELINE")
    print("=" * 60)

    # --------------------------------------------------------
    # Load data
    # --------------------------------------------------------

    print("\n===== LOADING DATA =====")

    train = pd.read_csv(TRAIN_PATH)
    validation = pd.read_csv(VALIDATION_PATH)

    print(f"Training rows   : {len(train):,}")
    print(f"Validation rows : {len(validation):,}")

    # --------------------------------------------------------
    # Prepare features and target
    # --------------------------------------------------------

    X_train = train[FEATURES]
    y_train = train[TARGET]

    X_val = validation[FEATURES]
    y_val = validation[TARGET]

    # --------------------------------------------------------
    # Data checks
    # --------------------------------------------------------

    print("\n===== DATA CHECK =====")

    print(f"Number of features : {len(FEATURES)}")

    print(
        f"Training positives : {y_train.sum():,}"
    )

    print(
        f"Training negatives : {(y_train == 0).sum():,}"
    )

    print(
        f"Validation positives : {y_val.sum():,}"
    )

    print(
        f"Validation negatives : {(y_val == 0).sum():,}"
    )

    print(
        f"Training missing values : "
        f"{X_train.isna().sum().sum()}"
    )

    print(
        f"Validation missing values : "
        f"{X_val.isna().sum().sum()}"
    )

    # --------------------------------------------------------
    # Feature verification
    # --------------------------------------------------------

    print("\n===== FEATURE VERIFICATION =====")

    for index, feature in enumerate(FEATURES, start=1):
        print(f"{index:2d}. {feature}")

    # --------------------------------------------------------
    # XGBoost configuration
    # --------------------------------------------------------

    print("\n===== XGBOOST CONFIGURATION =====")

    model = XGBClassifier(
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

    print("n_estimators     : 300")
    print("max_depth        : 6")
    print("learning_rate    : 0.1")
    print("subsample        : 1.0")
    print("colsample_bytree : 1.0")
    print("objective        : binary:logistic")
    print("eval_metric      : logloss")
    print("random_state     : 42")
    print("n_jobs           : -1")
    print("tree_method      : hist")
    print("class_weight     : None")
    print("scale_pos_weight : None")

    # --------------------------------------------------------
    # Train
    # --------------------------------------------------------

    print("\n===== TRAINING XGBOOST =====")

    print("Training model...")

    model.fit(
        X_train,
        y_train
    )

    print("Training completed successfully.")

    # --------------------------------------------------------
    # Save model
    # --------------------------------------------------------

    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(
        model,
        MODEL_PATH
    )

    print("\nModel saved to:")
    print(MODEL_PATH)

    # --------------------------------------------------------
    # Verification
    # --------------------------------------------------------

    print("\n===== MODEL VERIFICATION =====")

    print(
        f"Number of estimators : "
        f"{model.n_estimators}"
    )

    print(
        f"Number of features   : "
        f"{model.n_features_in_}"
    )

    print(
        f"Expected features    : "
        f"{len(FEATURES)}"
    )

    print(
        f"XGBoost version      : "
        f"{__import__('xgboost').__version__}"
    )

    print("\nPhase 8B completed successfully.")


if __name__ == "__main__":
    main()
