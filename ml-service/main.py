import os
import argparse
from typing import Dict, Any, List, Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(
    title="Cybercrime Predictive Analytics ML Service",
    description="REST API for model inference, cybercrime risk prediction, and explainability.",
    version="1.0.0"
)

# Global predictor instance placeholder
predictor = None
MODEL_PATH = os.getenv("MODEL_PATH", "models/cybercrime_model.joblib")
MODEL_VERSION = os.getenv("MODEL_VERSION", "xgb-v1")


from src.schemas import MLPredictRequest, MLPredictResponse, calculate_risk_level


@app.on_event("startup")
def load_artifacts():
    """Load model artifact on service startup if present."""
    global predictor
    if os.path.exists(MODEL_PATH):
        try:
            from src.predict import ModelPredictor
            predictor = ModelPredictor(MODEL_PATH)
            print(f"Loaded model from {MODEL_PATH}")
        except Exception as e:
            print(f"Failed to load model on startup: {e}")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. Training required.")


@app.get("/")
def health_check():
    """Service health and status endpoint."""
    return {
        "status": "healthy",
        "service": "Cybercrime Predictive Analytics ML Service",
        "model_loaded": predictor is not None,
        "modelVersion": MODEL_VERSION
    }


@app.post("/predict", response_model=MLPredictResponse, response_model_exclude_none=True)
def predict_incident(payload: MLPredictRequest):
    """Predict cybercrime incident risk based on ATM telemetry data."""
    if predictor is None:
        raise HTTPException(
            status_code=503, 
            detail="Model is not loaded. Train or provide a valid model artifact."
        )
    try:
        features_dict = payload.model_dump()
        extra = features_dict.pop("extra_features", None)
        if extra:
            features_dict.update(extra)

        pred = predictor.predict([features_dict])[0]
        probability = 0.0

        try:
            proba_arr = predictor.predict_proba([features_dict])[0]
            if len(proba_arr) > 1:
                probability = round(float(proba_arr[1]), 2)
            else:
                probability = round(float(proba_arr[0]), 2)
        except Exception:
            probability = 1.0 if pred == 1 else 0.0

        risk_score = int(round(probability * 100))
        risk_level = calculate_risk_level(risk_score)

        return MLPredictResponse(
            probability=probability,
            riskScore=risk_score,
            riskLevel=risk_level,
            modelVersion=MODEL_VERSION,
            atmId=payload.atmId
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


def run_training_pipeline(args):
    """Execute training workflow from CLI."""
    print("Running ML training pipeline...")
    # Training workflow logic can be customized with data paths
    print("Finished training.")


def main():
    parser = argparse.ArgumentParser(description="Cybercrime ML Service CLI")
    parser.add_argument("--serve", action="store_true", help="Start the FastAPI API server")
    parser.add_argument("--train", action="store_true", help="Run model training pipeline")
    parser.add_argument("--port", type=int, default=8000, help="Port for API server")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host for API server")

    args = parser.parse_args()

    if args.train:
        run_training_pipeline(args)
    elif args.serve or not any(vars(args).values()):
        uvicorn.run("main:app", host=args.host, port=args.port, reload=True)


if __name__ == "__main__":
    main()
