"""Phase 6: Model Training & Progression Pipeline.

Trains models according to the project progression hierarchy:
1. Logistic Regression (Baseline)
2. Random Forest (Comparison)
3. XGBoost (Primary Production Model)

Enforces strict time-aware splits (train.csv for fitting, validation.csv for tuning/evaluation).
"""

from pathlib import Path
from typing import Dict, Any, Optional, Tuple, List
import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
MODELS_DIR = Path(__file__).resolve().parents[1] / "models"

# Frozen Feature Catalog (21 features)
ALL_MODEL_FEATURES: List[str] = [
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
    "historical_hotspot_score"
]


def load_split(name: str) -> pd.DataFrame:
    """Load train, validation, or test partition from data/processed/."""
    path = PROCESSED_DIR / f"{name}.csv"
    df = pd.read_csv(path)
    return df


def prepare_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Extract model feature matrix X and target y."""
    X = df[ALL_MODEL_FEATURES].copy()
    y = df["target"].astype(int)
    return X, y


def train_logistic_regression() -> Pipeline:
    """Train Phase 6 unweighted Logistic Regression baseline model with standard scaling."""
    print("=" * 60)
    print("PHASE 6: LOGISTIC REGRESSION BASELINE")
    print("=" * 60)

    train_df = load_split("train")
    validation_df = load_split("validation")

    X_train, y_train = prepare_data(train_df)
    X_validation, y_validation = prepare_data(validation_df)

    print("\n===== DATA CHECK =====")
    print("Training rows:", len(X_train))
    print("Validation rows:", len(X_validation))
    print("Number of features:", len(ALL_MODEL_FEATURES))
    print("Training missing values:", X_train.isna().sum().sum())
    print("Validation missing values:", X_validation.isna().sum().sum())

    print("\nTraining positives:", y_train.sum())
    print("Validation positives:", y_validation.sum())

    # Pipeline: StandardScaler + unweighted LogisticRegression
    model = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=2000, random_state=42))
    ])

    print("\nTraining Logistic Regression...")
    model.fit(X_train, y_train)
    print("Training completed successfully.")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / "logistic_regression_baseline.joblib"
    joblib.dump(model, model_path)

    print("\nModel saved to:")
    print(model_path)

    return model


if __name__ == "__main__":
    train_logistic_regression()
