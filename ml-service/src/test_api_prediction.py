import json
from pathlib import Path

import joblib
import pandas as pd
import requests


BASE_DIR = Path(__file__).resolve().parent.parent

TEST_DATA_PATH = BASE_DIR / "data" / "processed" / "test.csv"
MODEL_PATH = BASE_DIR / "models" / "final" / "xgboost_fraud_predictor.joblib"
SCHEMA_PATH = BASE_DIR / "models" / "final" / "feature_schema.json"

API_URL = "http://127.0.0.1:8000/predict"


print("=" * 80)
print("PHASE 11.17: REAL DATASET -> FASTAPI -> XGBOOST VERIFICATION")
print("=" * 80)


# ---------------------------------------------------------------------------
# Load schema
# ---------------------------------------------------------------------------

with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
    schema = json.load(file)

MODEL_FEATURES = schema["features"]

print(f"\nModel features : {len(MODEL_FEATURES)}")

assert len(MODEL_FEATURES) == 21


# ---------------------------------------------------------------------------
# Load test dataset
# ---------------------------------------------------------------------------

df = pd.read_csv(TEST_DATA_PATH)

print(f"Test rows      : {len(df)}")


required_columns = MODEL_FEATURES + [
    "atm_id",
    "target",
]

missing_columns = [
    column for column in required_columns
    if column not in df.columns
]

assert not missing_columns, (
    f"Missing required columns: {missing_columns}"
)


# ---------------------------------------------------------------------------
# Select one normal and one positive observation
# ---------------------------------------------------------------------------

normal_row = df[df["target"] == 0].iloc[0]
positive_row = df[df["target"] == 1].iloc[0]

test_rows = [
    ("NORMAL", normal_row),
    ("FRAUD-BURST", positive_row),
]


# ---------------------------------------------------------------------------
# Load model for direct comparison
# ---------------------------------------------------------------------------

model = joblib.load(MODEL_PATH)


# ---------------------------------------------------------------------------
# Run both observations
# ---------------------------------------------------------------------------

for label, row in test_rows:

    print("\n" + "-" * 80)
    print(f"TEST CASE: {label}")
    print("-" * 80)

    atm_id = str(row["atm_id"])
    target = int(row["target"])

    print(f"ATM ID         : {atm_id}")
    print(f"Actual target  : {target}")

    # Only the 21 model features.
    features = {
        feature: (
            row[feature].item()
            if hasattr(row[feature], "item")
            else row[feature]
        )
        for feature in MODEL_FEATURES
    }

    # ---------------------------------------------------------------
    # Direct XGBoost inference
    # ---------------------------------------------------------------

    direct_probability = float(
        model.predict_proba(
            pd.DataFrame([features])
        )[0][1]
    )

    # ---------------------------------------------------------------
    # FastAPI inference
    # ---------------------------------------------------------------

    payload = {
        "atmId": atm_id,
        **features,
    }

    response = requests.post(
        API_URL,
        json=payload,
        timeout=10,
    )

    print(f"API status     : {response.status_code}")

    response.raise_for_status()

    api_result = response.json()

    api_probability = float(
        api_result["probability"]
    )

    print(f"Direct model   : {direct_probability:.8f}")
    print(f"FastAPI result  : {api_probability:.8f}")

    difference = abs(
        direct_probability - api_probability
    )

    print(f"Difference      : {difference:.8f}")

    print(f"Risk score      : {api_result['riskScore']}")
    print(f"Risk level      : {api_result['riskLevel']}")
    print(f"Model version   : {api_result['modelVersion']}")

    print(
        f"Prediction window: "
        f"{api_result['predictionWindowMinutes']} minutes"
    )

    # API returns probability rounded to 4 decimals.
    assert difference < 0.0001, (
        "FastAPI probability does not match direct model inference."
    )

    assert api_result["modelVersion"] == "xgb-v1"

    assert api_result["predictionWindowMinutes"] == 180

    assert 0 <= api_result["riskScore"] <= 100

    assert api_result["riskLevel"] in {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    print("Verification     : PASS")


print("\n" + "=" * 80)
print("PHASE 11.17 STATUS: PASS")
print("=" * 80)
