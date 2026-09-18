from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class MLPredictRequest(BaseModel):
    """
    Production input contract for the xgb-v1 cybercrime risk model.

    The model expects exactly 21 engineered features.
    """

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "atmId": "ATM1023",
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
                "historical_hotspot_score": 0.72
            }
        }
    )

    # Application-level identifier.
    # This is NOT passed to the ML model.
    atmId: str = Field(
        ...,
        min_length=1,
        description="Unique ATM identifier"
    )

    hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    is_weekend: int = Field(..., ge=0, le=1)

    complaints_last_1h: int = Field(..., ge=0)
    complaints_last_6h: int = Field(..., ge=0)
    complaints_last_24h: int = Field(..., ge=0)

    withdrawals_last_1h: int = Field(..., ge=0)
    withdrawals_last_6h: int = Field(..., ge=0)
    withdrawals_last_24h: int = Field(..., ge=0)

    withdrawal_count: int = Field(..., ge=0)
    total_withdrawal_amount: float = Field(..., ge=0.0)
    average_withdrawal: float = Field(..., ge=0.0)
    unique_accounts: int = Field(..., ge=0)
    transaction_velocity: float = Field(..., ge=0.0)

    complaints_1km: int = Field(..., ge=0)
    complaints_3km: int = Field(..., ge=0)

    fraud_events_1km: int = Field(..., ge=0)
    fraud_events_3km: int = Field(..., ge=0)

    distance_from_recent_fraud: float = Field(..., ge=0.0)
    historical_fraud_count: int = Field(..., ge=0)
    historical_hotspot_score: float = Field(..., ge=0.0)


class MLPredictResponse(BaseModel):
    """Prediction returned by the ML service."""

    probability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Predicted probability of elevated fraud activity"
    )

    riskScore: int = Field(
        ...,
        ge=0,
        le=100,
        description="Prototype risk score from 0 to 100"
    )

    riskLevel: Literal[
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
    ]

    modelVersion: str

    predictionWindowMinutes: int = Field(
        ...,
        ge=1,
        description="Prediction horizon in minutes"
    )

    atmId: str


def calculate_risk_level(
    risk_score: int
) -> Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
    """
    Prototype risk thresholds.

    0-29   LOW
    30-59  MEDIUM
    60-79  HIGH
    80-100 CRITICAL
    """

    if risk_score >= 80:
        return "CRITICAL"

    if risk_score >= 60:
        return "HIGH"

    if risk_score >= 30:
        return "MEDIUM"

    return "LOW"
