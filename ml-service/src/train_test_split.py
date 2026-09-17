"""Phase 5: Time-Aware Train/Test Split Pipeline.

Implements strict chronological train/validation/test splitting to prevent future information leakage:
- Train: First 70% of chronological observations (~Jan 01 to Jun 20, 2026)
- Validation: Middle 15% of observations (~Jun 20 to Jul 25, 2026)
- Test: Final 15% of observations (~Jul 25 to Aug 31, 2026)

Freezes the ML model feature catalog and validates zero temporal overlap.
"""

from pathlib import Path
from typing import Tuple, List
import pandas as pd

PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"

# 5.8 — Frozen Model Feature Catalog (21 engineered features)
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


def load_feature_dataset() -> pd.DataFrame:
    """Load the engineered feature dataset and parse observation timestamps."""
    path = PROCESSED_DIR / "feature_dataset.csv"
    df = pd.read_csv(path)
    df["observation_time"] = pd.to_datetime(df["observation_time"])
    return df


def inspect_temporal_data(df: pd.DataFrame) -> None:
    """Inspect row count, columns, time span, and target distribution."""
    print("\n===== DATASET =====")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))

    print("\n===== TIME RANGE =====")
    print("Start:", df["observation_time"].min())
    print("End:", df["observation_time"].max())

    print("\n===== TARGET =====")
    print(df["target"].value_counts())
    print(
        df["target"]
        .value_counts(normalize=True)
        .mul(100)
        .round(2)
    )


def check_temporal_order(df: pd.DataFrame) -> None:
    """Verify whether observation timestamps are strictly monotonically sorted."""
    is_sorted = df["observation_time"].is_monotonic_increasing
    print("\nChronologically sorted:", is_sorted)


def chronological_split(
    df: pd.DataFrame,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Perform pure chronological train/val/test split."""
    df = df.sort_values("observation_time").reset_index(drop=True)
    n = len(df)
    train_end = int(n * train_ratio)
    validation_end = int(n * (train_ratio + val_ratio))

    train_df = df.iloc[:train_end].copy()
    validation_df = df.iloc[train_end:validation_end].copy()
    test_df = df.iloc[validation_end:].copy()

    return train_df, validation_df, test_df


def report_split(name: str, df: pd.DataFrame) -> None:
    """Generate summary report for a split partition."""
    print(f"\n===== {name.upper()} =====")
    print("Rows:", len(df))
    print("Start:", df["observation_time"].min())
    print("End:", df["observation_time"].max())
    print("\nTarget:")
    print(df["target"].value_counts())
    print("\nTarget %:")
    print((df["target"].value_counts(normalize=True) * 100).round(2))


def validate_split_boundaries(
    train_df: pd.DataFrame,
    validation_df: pd.DataFrame,
    test_df: pd.DataFrame
) -> None:
    """Validate strict temporal non-overlap across partition boundaries."""
    assert (
        train_df["observation_time"].max() < validation_df["observation_time"].min()
    ), "Temporal overlap between Train and Validation sets!"

    assert (
        validation_df["observation_time"].max() < test_df["observation_time"].min()
    ), "Temporal overlap between Validation and Test sets!"

    print("\nTemporal boundaries: PASS")


def validate_target_presence(
    train_df: pd.DataFrame,
    validation_df: pd.DataFrame,
    test_df: pd.DataFrame
) -> None:
    """Ensure every partition contains sufficient positive target examples."""
    datasets = {
        "train": train_df,
        "validation": validation_df,
        "test": test_df
    }

    print("\n===== TARGET PRESENCE CHECK =====")
    for name, data in datasets.items():
        positives = (data["target"] == 1).sum()
        negatives = (data["target"] == 0).sum()
        print(f"{name}: positive={positives}, negative={negatives}")
        assert positives > 0, f"No positive examples in {name}"


def validate_model_features(
    df: pd.DataFrame,
    feature_columns: List[str]
) -> None:
    """Audit feature set to prevent identifier, target, or future leakage."""
    forbidden = {
        "risk_label",
        "complaint_id",
        "transaction_id",
        "transaction_reference",
        "future_fraud_withdrawals_3h",
        "target"
    }

    leakage = set(feature_columns) & forbidden
    assert not leakage, f"Leakage detected: {leakage}"

    missing = set(feature_columns) - set(df.columns)
    assert not missing, f"Missing features: {missing}"

    print("\nModel feature leakage check: PASS")


def save_splits(
    train_df: pd.DataFrame,
    validation_df: pd.DataFrame,
    test_df: pd.DataFrame
) -> None:
    """Save the train, validation, and test sets to data/processed/."""
    train_df.to_csv(PROCESSED_DIR / "train.csv", index=False)
    validation_df.to_csv(PROCESSED_DIR / "validation.csv", index=False)
    test_df.to_csv(PROCESSED_DIR / "test.csv", index=False)
    print("\nTrain/validation/test datasets saved.")


if __name__ == "__main__":
    print("=" * 60)
    print("PHASE 5: TIME-AWARE TRAIN/TEST SPLIT")
    print("=" * 60)

    df = load_feature_dataset()

    inspect_temporal_data(df)

    check_temporal_order(df)

    (
        train_df,
        validation_df,
        test_df
    ) = chronological_split(df)

    report_split("Train", train_df)

    report_split("Validation", validation_df)

    report_split("Test", test_df)

    validate_split_boundaries(
        train_df,
        validation_df,
        test_df
    )

    validate_target_presence(
        train_df,
        validation_df,
        test_df
    )

    validate_model_features(
        df,
        ALL_MODEL_FEATURES
    )

    save_splits(
        train_df,
        validation_df,
        test_df
    )

    print("\nPHASE 5 SPLIT PREPARATION COMPLETE.")
