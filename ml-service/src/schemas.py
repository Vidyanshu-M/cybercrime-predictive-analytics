from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Union, Literal


class MLPredictRequest(BaseModel):
    """Input contract schema for ML prediction requests.
    
    Baseline contract for cybercrime / ATM fraud risk scoring.
    Note: Schema will be expanded during Phase 4 (Feature Engineering).
    """
    atmId: str = Field(
        ..., 
        description="Unique ATM identifier", 
        examples=["ATM1023"]
    )
    hour: int = Field(
        ..., 
        ge=0, 
        le=23, 
        description="Hour of day (0-23)", 
        examples=[20]
    )
    complaints24h: int = Field(
        ..., 
        ge=0, 
        description="Number of incident complaints reported in the last 24 hours", 
        examples=[17]
    )
    withdrawals6h: int = Field(
        ..., 
        ge=0, 
        description="Total withdrawal transactions in the last 6 hours", 
        examples=[8]
    )
    nearbyFraud: int = Field(
        ..., 
        ge=0, 
        description="Number of reported fraud incidents in the surrounding radius", 
        examples=[5]
    )
    distance: float = Field(
        ..., 
        ge=0.0, 
        description="Distance metric (e.g., km to nearest incident hotspot or police station)", 
        examples=[0.8]
    )
    extra_features: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional additional features for forward compatibility during Phase 4 feature engineering",
        examples=[{"dayOfWeek": 5}]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "atmId": "ATM1023",
                "hour": 20,
                "complaints24h": 17,
                "withdrawals6h": 8,
                "nearbyFraud": 5,
                "distance": 0.8
            }
        }



class MLPredictResponse(BaseModel):
    """Output contract schema returned by the ML prediction service.

    Fields:
    - probability: Model's predicted probability (0.0 - 1.0)
    - riskScore: 0–100 prototype score
    - riskLevel: LOW / MEDIUM / HIGH / CRITICAL
    - modelVersion: Which trained model produced the prediction
    """
    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Model's predicted probability [0.0 - 1.0]",
        examples=[0.91]
    )
    riskScore: int = Field(
        ...,
        ge=0,
        le=100,
        description="0–100 prototype risk score",
        examples=[91]
    )
    riskLevel: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(
        ...,
        description="Risk tier: LOW / MEDIUM / HIGH / CRITICAL",
        examples=["CRITICAL"]
    )
    modelVersion: str = Field(
        ...,
        description="Identifier of the model producing the prediction",
        examples=["xgb-v1"]
    )
    atmId: Optional[str] = Field(
        default=None,
        description="Associated ATM identifier from the request",
        examples=["ATM1023"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "probability": 0.91,
                "riskScore": 91,
                "riskLevel": "CRITICAL",
                "modelVersion": "xgb-v1"
            }
        }


def calculate_risk_level(risk_score: int) -> Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
    """Map a 0-100 risk score to its corresponding risk tier.

    Prototype Thresholds (Hackathon Prototype only, not official operational thresholds):
    - 0–29   : LOW
    - 30–59  : MEDIUM
    - 60–79  : HIGH
    - 80–100 : CRITICAL

    Args:
        risk_score (int): Scaled risk score between 0 and 100.

    Returns:
        Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]: The evaluated risk level.
    """
    if risk_score >= 80:
        return "CRITICAL"
    elif risk_score >= 60:
        return "HIGH"
    elif risk_score >= 30:
        return "MEDIUM"
    else:
        return "LOW"

