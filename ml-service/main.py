from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="CyberTrace ML Engine")

class PredictionRequest(BaseModel):
    atmId: str
    predictionWindowMinutes: int = 180

@app.post("/predict")
def predict_risk(request: PredictionRequest):


    print(f"[LIVE] Spring Boot requested ML prediction for ATM: {request.atmId}")
    
    return {
        "atmId": request.atmId,
        "probability": 0.92,
        "riskScore": 92,
        "riskLevel": "CRITICAL",
        "modelVersion": "xgb-fastapi-live",
        "predictionWindow": {
            "start": "2026-09-19T20:00:00",
            "end": "2026-09-19T23:00:00"
        },
        "reasons": [
            "FastAPI Server Live Connection Established",
            "High complaint density detected by ML Engine"
        ]
    }