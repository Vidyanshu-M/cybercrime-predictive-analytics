from pathlib import Path

from startup_validation import validate_startup_artifacts


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_FEATURES = [
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


def main():
    print("=" * 70)
    print("PHASE 12A.4 - STARTUP ARTIFACT VALIDATION")
    print("=" * 70)

    result = validate_startup_artifacts(
        BASE_DIR,
        MODEL_FEATURES,
    )

    print("Production model              : PASS")
    print("Feature schema                : PASS")
    print("Metadata                      : PASS")
    print("Feature count                 : PASS")
    print("Feature order                 : PASS")
    print("Model version                 : PASS")
    print("Prediction window             : PASS")
    print("Threshold                     : PASS")
    print("Model predict_proba           : PASS")

    print()
    print("Validated configuration:")
    print(f"  Model version : {result['model_version']}")
    print(f"  Features      : {result['feature_count']}")
    print(f"  Threshold     : {result['threshold']}")
    print(
        f"  Window        : "
        f"{result['prediction_window_minutes']} minutes"
    )

    print()
    print("=" * 70)
    print("PHASE 12A.4 STATUS: PASS")
    print("=" * 70)


if __name__ == "__main__":
    main()
