import json
from pathlib import Path

import joblib


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "final" / "xgboost_fraud_predictor.joblib"
METADATA_PATH = BASE_DIR / "models" / "final" / "model_metadata.json"
SCHEMA_PATH = BASE_DIR / "models" / "final" / "feature_schema.json"


print("=" * 80)
print("PHASE 10: FINAL MODEL PACKAGE VERIFICATION")
print("=" * 80)

print("\nLoading model...")
model = joblib.load(MODEL_PATH)

print(f"Model type       : {type(model).__name__}")

with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata = json.load(f)

with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
    schema = json.load(f)

print(f"Model version    : {metadata['model_version']}")
print(f"Experiment       : {metadata['experiment']}")
print(f"Feature count    : {schema['feature_count']}")
print(f"Threshold        : {metadata['threshold']}")
print(
    f"Prediction window: "
    f"{metadata['prediction_window_hours']} hours"
)

print("\nModel configuration:")
for key, value in metadata["training_configuration"].items():
    print(f"  {key}: {value}")

print("\nFeature schema:")
for index, feature in enumerate(schema["features"], start=1):
    print(f"  {index:02d}. {feature}")

print("\nFinal test metrics:")
for key, value in metadata["test_metrics"].items():
    print(f"  {key}: {value}")

print("\nValidation checks:")

assert MODEL_PATH.exists()
print("  Model artifact exists       : PASS")

assert METADATA_PATH.exists()
print("  Metadata exists             : PASS")

assert SCHEMA_PATH.exists()
print("  Feature schema exists       : PASS")

assert schema["feature_count"] == 21
print("  Feature count = 21         : PASS")

assert len(schema["features"]) == 21
print("  Feature list length = 21   : PASS")

assert metadata["model_version"] == "xgb-v1"
print("  Model version = xgb-v1     : PASS")

assert metadata["threshold"] == 0.5
print("  Threshold = 0.50           : PASS")

assert metadata["prediction_window_hours"] == 3
print("  Prediction window = 3h      : PASS")

print("\n" + "=" * 80)
print("PHASE 10 STATUS: PASS")
print("=" * 80)
