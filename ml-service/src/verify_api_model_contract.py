import json
from pathlib import Path
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import joblib

BASE_DIR = Path(__file__).resolve().parent.parent

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "final"
    / "xgboost_fraud_predictor.joblib"
)

SCHEMA_PATH = (
    BASE_DIR
    / "models"
    / "final"
    / "feature_schema.json"
)

METADATA_PATH = (
    BASE_DIR
    / "models"
    / "final"
    / "model_metadata.json"
)

EXPECTED_FEATURE_COUNT = 21
EXPECTED_MODEL_VERSION = "xgb-v1"
EXPECTED_THRESHOLD = 0.50
EXPECTED_WINDOW_MINUTES = 180


def load_json(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def main():
    print("=" * 70)
    print("PHASE 12A.3 - MODEL/API CONTRACT CONSISTENCY")
    print("=" * 70)

    # ------------------------------------------------------------------
    # 1. Verify artifacts exist
    # ------------------------------------------------------------------

    assert MODEL_PATH.exists(), (
        f"Model artifact not found: {MODEL_PATH}"
    )

    assert SCHEMA_PATH.exists(), (
        f"Feature schema not found: {SCHEMA_PATH}"
    )

    assert METADATA_PATH.exists(), (
        f"Model metadata not found: {METADATA_PATH}"
    )

    print("Production artifacts          : PASS")

    # ------------------------------------------------------------------
    # 2. Load packaged schema and metadata
    # ------------------------------------------------------------------

    schema = load_json(SCHEMA_PATH)
    metadata = load_json(METADATA_PATH)

    packaged_features = schema["features"]

    assert len(packaged_features) == EXPECTED_FEATURE_COUNT

    print("Packaged feature count        : PASS")

    # ------------------------------------------------------------------
    # 3. Verify metadata
    # ------------------------------------------------------------------

    assert metadata["modelVersion"] == EXPECTED_MODEL_VERSION
    assert metadata["predictionWindowMinutes"] == EXPECTED_WINDOW_MINUTES
    assert metadata["threshold"] == EXPECTED_THRESHOLD

    print("Model metadata                : PASS")

    # ------------------------------------------------------------------
    # 4. Import the API feature contract
    # ------------------------------------------------------------------

    from main import MODEL_FEATURES

    assert len(MODEL_FEATURES) == EXPECTED_FEATURE_COUNT

    print("FastAPI feature count        : PASS")

    # ------------------------------------------------------------------
    # 5. Compare exact feature order
    # ------------------------------------------------------------------

    assert MODEL_FEATURES == packaged_features, (
        "\nFeature contract mismatch!\n"
        f"FastAPI:\n{MODEL_FEATURES}\n\n"
        f"Packaged schema:\n{packaged_features}"
    )

    print("FastAPI ↔ packaged schema    : PASS")

    # ------------------------------------------------------------------
    # 6. Load model
    # ------------------------------------------------------------------

    model = joblib.load(MODEL_PATH)

    assert hasattr(model, "predict_proba"), (
        "Production model does not expose predict_proba()."
    )

    print("Model artifact                : PASS")

    # ------------------------------------------------------------------
    # 7. Verify model feature count
    # ------------------------------------------------------------------

    if hasattr(model, "n_features_in_"):
        assert model.n_features_in_ == EXPECTED_FEATURE_COUNT

        print("Model feature count           : PASS")
    else:
        print(
            "Model feature count           : SKIPPED "
            "(artifact does not expose n_features_in_)"
        )

    # ------------------------------------------------------------------
    # Final
    # ------------------------------------------------------------------

    print()
    print("=" * 70)
    print("PHASE 12A.3 STATUS: PASS")
    print("=" * 70)


if __name__ == "__main__":
    main()
