"""Phase 7D: Random Forest Feature Importance Analysis.

Inspects Gini/impurity-based feature importances across the 21 engineered features
from the trained Random Forest baseline model.
"""

import os
import joblib
import pandas as pd


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


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "random_forest_baseline.joblib",
)


def main():

    print("=" * 60)
    print("PHASE 7D: RANDOM FOREST FEATURE IMPORTANCE")
    print("=" * 60)

    print("\nLoading Random Forest model...")

    model = joblib.load(MODEL_PATH)

    print("Model loaded successfully.")

    # --------------------------------------------------------
    # Feature importance
    # --------------------------------------------------------

    importance = model.feature_importances_

    importance_df = pd.DataFrame({
        "feature": FEATURES,
        "importance": importance
    })

    importance_df = importance_df.sort_values(
        by="importance",
        ascending=False
    ).reset_index(drop=True)

    importance_df["rank"] = (
        importance_df.index + 1
    )

    # --------------------------------------------------------
    # Output
    # --------------------------------------------------------

    print("\n===== FEATURE IMPORTANCE =====")

    print(
        importance_df[
            ["rank", "feature", "importance"]
        ].to_string(index=False)
    )

    # --------------------------------------------------------
    # Top features
    # --------------------------------------------------------

    print("\n===== TOP 10 FEATURES =====")

    for _, row in importance_df.head(10).iterrows():

        print(
            f"{int(row['rank']):2d}. "
            f"{row['feature']:<35} "
            f"{row['importance']:.6f}"
        )

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    print("\n===== IMPORTANCE CHECK =====")

    print(
        f"Number of features : {len(importance_df)}"
    )

    print(
        f"Importance sum     : "
        f"{importance_df['importance'].sum():.6f}"
    )

    print("\nExpected:")
    print("Number of features = 21")
    print("Importance sum     = approximately 1.000000")

    print("\nPhase 7D completed successfully.")


if __name__ == "__main__":
    main()
