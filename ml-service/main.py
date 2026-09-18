import os
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException

from src.predict import ModelPredictor
from src.schemas import (
    MLPredictRequest,
    MLPredictResponse,
    calculate_risk_level,
)
from src.startup_validation import validate_startup_artifacts


BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = Path(
    os.getenv(
        "MODEL_PATH",
        str(BASE_DIR / "models" / "final" / "xgboost_fraud_predictor.joblib"),
    )
)

MODEL_VERSION = os.getenv("MODEL_VERSION", "xgb-v1")

PREDICTION_WINDOW_MINUTES = 180

RISK_THRESHOLD = 0.50

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


app = FastAPI(
    title="Cybercrime Predictive Analytics ML Service",
    description=(
        "ML inference service for cybercrime and ATM fraud "
        "risk prediction using the frozen xgb-v1 model."
    ),
    version="1.0.0",
)


predictor: ModelPredictor | None = None


@app.on_event("startup")
def load_artifacts() -> None:
    """Validate and load production ML artifacts when the service starts."""

    global predictor

    print("=" * 80, flush=True)
    print("CYBERCRIME ML SERVICE STARTUP", flush=True)
    print("=" * 80, flush=True)

    print(f"Model path    : {MODEL_PATH}", flush=True)
    print(f"Model version : {MODEL_VERSION}", flush=True)

    try:
        validation = validate_startup_artifacts(
            BASE_DIR,
            MODEL_FEATURES,
        )

        print("Startup validation: PASS", flush=True)
        print(
            f"Features      : "
            f"{validation['feature_count']}",
            flush=True,
        )
        print(
            f"Threshold     : "
            f"{validation['threshold']}",
            flush=True,
        )
        print(
            f"Window        : "
            f"{validation['prediction_window_minutes']} minutes",
            flush=True,
        )

        predictor = ModelPredictor(str(MODEL_PATH))

        print("Model loaded successfully.", flush=True)
        print("Service readiness: PASS", flush=True)

    except Exception as exc:
        predictor = None

        print("STARTUP VALIDATION FAILED", flush=True)
        print(f"Error: {exc}", flush=True)

    print("=" * 80, flush=True)


@app.get("/")
def root():
    """Basic service information."""

    return {
        "service": "Cybercrime Predictive Analytics ML Service",
        "status": "running",
        "modelVersion": MODEL_VERSION,
        "modelLoaded": predictor is not None,
    }


@app.get("/health")
def health():
    """Health/readiness endpoint."""

    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded.",
        )

    return {
        "status": "healthy",
        "service": "Cybercrime Predictive Analytics ML Service",
        "modelLoaded": True,
        "modelVersion": MODEL_VERSION,
    }


@app.post(
    "/predict",
    response_model=MLPredictResponse,
)
def predict(payload: MLPredictRequest):
    """Generate an ATM fraud-risk prediction."""

    if predictor is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded.",
        )

    try:
        payload_dict = payload.model_dump()

        atm_id = payload_dict.pop("atmId")

        features = {
            feature: payload_dict[feature]
            for feature in MODEL_FEATURES
        }

        probability_array = predictor.predict_proba([features])

        if probability_array.shape[1] < 2:
            raise RuntimeError(
                "Model does not provide binary class probabilities."
            )

        probability = float(probability_array[0][1])

        predicted_class = int(
            probability >= RISK_THRESHOLD
        )

        risk_score = int(round(probability * 100))

        risk_level = calculate_risk_level(risk_score)

        return MLPredictResponse(
            probability=round(probability, 6),
            riskScore=risk_score,
            riskLevel=risk_level,
            modelVersion=MODEL_VERSION,
            predictionWindowMinutes=PREDICTION_WINDOW_MINUTES,
            atmId=atm_id,
        )

    except KeyError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Missing model feature: {exc}",
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(exc)}",
        ) from exc


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
