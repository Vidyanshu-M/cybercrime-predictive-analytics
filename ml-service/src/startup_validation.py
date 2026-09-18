import json
from pathlib import Path
from typing import Any

import joblib


EXPECTED_MODEL_VERSION = "xgb-v1"
EXPECTED_FEATURE_COUNT = 21
EXPECTED_THRESHOLD = 0.50
EXPECTED_PREDICTION_WINDOW_MINUTES = 180


def load_json(path: Path) -> dict[str, Any]:
    """Load a JSON object from disk."""
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def validate_startup_artifacts(
    base_dir: Path,
    api_features: list[str],
) -> dict[str, Any]:
    """
    Validate production model, feature schema and metadata.

    Raises:
        FileNotFoundError: If a required artifact is missing.
        ValueError: If artifacts/configuration are inconsistent.

    Returns:
        A summary of the validated configuration.
    """

    model_path = (
        base_dir
        / "models"
        / "final"
        / "xgboost_fraud_predictor.joblib"
    )

    schema_path = (
        base_dir
        / "models"
        / "final"
        / "feature_schema.json"
    )

    metadata_path = (
        base_dir
        / "models"
        / "final"
        / "model_metadata.json"
    )

    # ---------------------------------------------------------------
    # 1. Required artifacts
    # ---------------------------------------------------------------

    for artifact_name, artifact_path in {
        "model": model_path,
        "feature schema": schema_path,
        "model metadata": metadata_path,
    }.items():

        if not artifact_path.exists():
            raise FileNotFoundError(
                f"Required {artifact_name} artifact not found: "
                f"{artifact_path}"
            )

    # ---------------------------------------------------------------
    # 2. Load schema and metadata
    # ---------------------------------------------------------------

    schema = load_json(schema_path)
    metadata = load_json(metadata_path)

    packaged_features = schema.get("features")

    if not isinstance(packaged_features, list):
        raise ValueError(
            "feature_schema.json must contain a 'features' list."
        )

    # ---------------------------------------------------------------
    # 3. Feature count
    # ---------------------------------------------------------------

    schema_feature_count = schema.get("feature_count")

    if schema_feature_count != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"Schema feature_count is {schema_feature_count}; "
            f"expected {EXPECTED_FEATURE_COUNT}."
        )

    if len(packaged_features) != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"Schema contains {len(packaged_features)} features; "
            f"expected {EXPECTED_FEATURE_COUNT}."
        )

    if len(api_features) != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"FastAPI contains {len(api_features)} features; "
            f"expected {EXPECTED_FEATURE_COUNT}."
        )

    # ---------------------------------------------------------------
    # 4. Exact feature order
    # ---------------------------------------------------------------

    if api_features != packaged_features:
        raise ValueError(
            "FastAPI feature order does not match "
            "feature_schema.json."
        )

    # ---------------------------------------------------------------
    # 5. Metadata consistency
    # ---------------------------------------------------------------

    metadata_version = metadata.get("model_version")

    if metadata_version != EXPECTED_MODEL_VERSION:
        raise ValueError(
            f"Metadata model_version is {metadata_version}; "
            f"expected {EXPECTED_MODEL_VERSION}."
        )

    metadata_alias = metadata.get("modelVersion")

    if metadata_alias != EXPECTED_MODEL_VERSION:
        raise ValueError(
            f"Metadata modelVersion is {metadata_alias}; "
            f"expected {EXPECTED_MODEL_VERSION}."
        )

    metadata_feature_count = metadata.get("features_count")

    if metadata_feature_count != EXPECTED_FEATURE_COUNT:
        raise ValueError(
            f"Metadata features_count is {metadata_feature_count}; "
            f"expected {EXPECTED_FEATURE_COUNT}."
        )

    threshold = metadata.get("threshold")

    if threshold != EXPECTED_THRESHOLD:
        raise ValueError(
            f"Metadata threshold is {threshold}; "
            f"expected {EXPECTED_THRESHOLD}."
        )

    prediction_window_minutes = metadata.get(
        "predictionWindowMinutes"
    )

    if prediction_window_minutes != EXPECTED_PREDICTION_WINDOW_MINUTES:
        raise ValueError(
            "Metadata predictionWindowMinutes is "
            f"{prediction_window_minutes}; expected "
            f"{EXPECTED_PREDICTION_WINDOW_MINUTES}."
        )

    # ---------------------------------------------------------------
    # 6. Load and inspect model
    # ---------------------------------------------------------------

    model = joblib.load(model_path)

    if not hasattr(model, "predict_proba"):
        raise ValueError(
            "Production model does not support predict_proba()."
        )

    if hasattr(model, "n_features_in_"):
        if model.n_features_in_ != EXPECTED_FEATURE_COUNT:
            raise ValueError(
                f"Model expects {model.n_features_in_} features; "
                f"expected {EXPECTED_FEATURE_COUNT}."
            )

    # ---------------------------------------------------------------
    # 7. Return validated configuration
    # ---------------------------------------------------------------

    return {
        "model_path": str(model_path),
        "model_version": EXPECTED_MODEL_VERSION,
        "feature_count": EXPECTED_FEATURE_COUNT,
        "threshold": EXPECTED_THRESHOLD,
        "prediction_window_minutes": EXPECTED_PREDICTION_WINDOW_MINUTES,
    }
