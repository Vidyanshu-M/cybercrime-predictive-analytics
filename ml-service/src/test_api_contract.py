import requests

API_BASE_URL = "http://127.0.0.1:8000"

EXPECTED_MODEL_VERSION = "xgb-v1"
EXPECTED_WINDOW_MINUTES = 180

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


def sample_payload():
    return {
        "atmId": "ATM-TEST-001",
        "hour": 20,
        "day_of_week": 4,
        "is_weekend": 0,
        "complaints_last_1h": 3,
        "complaints_last_6h": 8,
        "complaints_last_24h": 17,
        "withdrawals_last_1h": 5,
        "withdrawals_last_6h": 8,
        "withdrawals_last_24h": 24,
        "withdrawal_count": 5,
        "total_withdrawal_amount": 12500.0,
        "average_withdrawal": 2500.0,
        "unique_accounts": 4,
        "transaction_velocity": 5.0,
        "complaints_1km": 4,
        "complaints_3km": 12,
        "fraud_events_1km": 2,
        "fraud_events_3km": 5,
        "distance_from_recent_fraud": 0.8,
        "historical_fraud_count": 15,
        "historical_hotspot_score": 0.72,
    }


def test_health():
    response = requests.get(
        f"{API_BASE_URL}/health",
        timeout=10,
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] == "healthy"
    assert result["modelLoaded"] is True
    assert result["modelVersion"] == EXPECTED_MODEL_VERSION

    print("Health endpoint             : PASS")


def test_predict_valid_payload():
    payload = sample_payload()

    response = requests.post(
        f"{API_BASE_URL}/predict",
        json=payload,
        timeout=10,
    )

    assert response.status_code == 200

    result = response.json()

    assert set(result.keys()) == {
        "probability",
        "riskScore",
        "riskLevel",
        "modelVersion",
        "predictionWindowMinutes",
        "atmId",
    }

    assert 0.0 <= result["probability"] <= 1.0
    assert 0 <= result["riskScore"] <= 100

    assert result["riskLevel"] in {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }

    assert result["modelVersion"] == EXPECTED_MODEL_VERSION
    assert result["predictionWindowMinutes"] == EXPECTED_WINDOW_MINUTES
    assert result["atmId"] == payload["atmId"]

    print("Valid /predict request       : PASS")


def test_probability_precision():
    payload = sample_payload()

    response = requests.post(
        f"{API_BASE_URL}/predict",
        json=payload,
        timeout=10,
    )

    assert response.status_code == 200

    result = response.json()

    probability_text = str(result["probability"])

    if "." in probability_text:
        decimal_places = len(probability_text.split(".")[1])
        assert decimal_places <= 6

    print("Probability precision        : PASS")


def test_missing_feature_rejected():
    payload = sample_payload()

    payload.pop("complaints_last_24h")

    response = requests.post(
        f"{API_BASE_URL}/predict",
        json=payload,
        timeout=10,
    )

    assert response.status_code == 422

    print("Missing feature rejection    : PASS")


def test_unknown_feature_rejected():
    payload = sample_payload()

    payload["complaints24h"] = 17

    response = requests.post(
        f"{API_BASE_URL}/predict",
        json=payload,
        timeout=10,
    )

    assert response.status_code == 422

    print("Unknown feature rejection   : PASS")


def test_invalid_hour_rejected():
    payload = sample_payload()

    payload["hour"] = 25

    response = requests.post(
        f"{API_BASE_URL}/predict",
        json=payload,
        timeout=10,
    )

    assert response.status_code == 422

    print("Invalid hour rejection       : PASS")


def test_invalid_negative_amount_rejected():
    payload = sample_payload()

    payload["total_withdrawal_amount"] = -100

    response = requests.post(
        f"{API_BASE_URL}/predict",
        json=payload,
        timeout=10,
    )

    assert response.status_code == 422

    print("Negative amount rejection    : PASS")


def test_feature_contract_count():
    payload = sample_payload()

    actual_features = [
        key for key in payload
        if key != "atmId"
    ]

    assert len(actual_features) == 21
    assert set(actual_features) == set(MODEL_FEATURES)

    print("21-feature contract          : PASS")


def run_all_tests():
    print("=" * 70)
    print("PHASE 12A.2 - API CONTRACT TESTS")
    print("=" * 70)

    test_health()
    test_feature_contract_count()
    test_predict_valid_payload()
    test_probability_precision()
    test_missing_feature_rejected()
    test_unknown_feature_rejected()
    test_invalid_hour_rejected()
    test_invalid_negative_amount_rejected()

    print()
    print("=" * 70)
    print("PHASE 12A.2 STATUS: PASS")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()
