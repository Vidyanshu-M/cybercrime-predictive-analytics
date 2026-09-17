# ML Service Interface Contract (Phase 0 Baseline)

This document specifies the communication contract between the **Backend Service** and the **ML Service**.

> [!NOTE]
> This contract defines the **Phase 0 baseline**. The feature set will be further refined and expanded during **Phase 4 (Feature Engineering)**. Forward compatibility is supported via optional parameters.

---

## 1. Service Endpoints

- **Base URL**: `http://localhost:8000` (or configured via environment)
- **API Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

---

## 2. Health Check Endpoint

### `GET /`
Verifies service availability and model loading status.

#### Response:
```json
{
  "status": "healthy",
  "service": "Cybercrime Predictive Analytics ML Service",
  "model_loaded": true
}
```

---

## 3. Predict Endpoint

### `POST /predict`
Scores ATM telemetry data to evaluate cybercrime/fraud probability and risk tier.

### Request Headers
```http
Content-Type: application/json
```

### Request Payload (`MLPredictRequest`)

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `atmId` | string | Yes | Unique identifier for the ATM terminal | `"ATM1023"` |
| `hour` | integer | Yes | Hour of the day in 24h format (`0` - `23`) | `20` |
| `complaints24h` | integer | Yes | Total incident complaints reported within the past 24 hours | `17` |
| `withdrawals6h` | integer | Yes | Total cash withdrawal transactions in the past 6 hours | `8` |
| `nearbyFraud` | integer | Yes | Reported fraudulent occurrences in the surrounding area | `5` |
| `distance` | float | Yes | Distance parameter (e.g., km to nearest incident hotspot or police post) | `0.8` |
| `extra_features` | object | No | Optional dictionary for forward-compatible features during Phase 4 | `{ "dayOfWeek": 5 }` |

#### Request Example:
```json
{
  "atmId": "ATM1023",
  "hour": 20,
  "complaints24h": 17,
  "withdrawals6h": 8,
  "nearbyFraud": 5,
  "distance": 0.8
}
```

---

### Response Payload (`MLPredictResponse`)

| Field | Type | Description | Example |
|---|---|---|---|
| `probability` | float | Model's predicted incident/fraud probability (`0.0` to `1.0`) | `0.91` |
| `riskScore` | integer | `0`–`100` prototype score computed from probability | `91` |
| `riskLevel` | string | Categorical classification: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | `"CRITICAL"` |
| `modelVersion` | string | Identifier of the trained model producing the prediction | `"xgb-v1"` |
| `atmId` | string (optional) | Associated ATM identifier from the request | `"ATM1023"` |

#### Risk Level Prototype Thresholds

> [!NOTE]
> These thresholds come directly from the blueprint and are explicitly described as **prototype thresholds only**, not official operational thresholds.

| Risk Score | Level | Description |
|:---:|:---:|:---|
| **0 – 29** | `LOW` | Normal activity; minimal fraud or incident indicator |
| **30 – 59** | `MEDIUM` | Elevated activity or minor anomaly detected; standard monitoring |
| **60 – 79** | `HIGH` | High probability of fraudulent behavior; prompt review recommended |
| **80 – 100** | `CRITICAL` | Severe threat indicators; immediate automated / investigator intervention |

#### Field Descriptions:
- **`probability`**: Direct model output probability (`0.0` to `1.0`).
- **`riskScore`**: Scaled prototype integer score `0`–`100` (`int(round(probability * 100))`).
- **`riskLevel`**: Categorical tier evaluated via prototype thresholds (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **`modelVersion`**: Identifier of the active trained model (e.g. `xgb-v1`).

#### Response Example:
```json
{
  "probability": 0.91,
  "riskScore": 91,
  "riskLevel": "CRITICAL",
  "modelVersion": "xgb-v1"
}
```

---

## 4. Error Responses

- `400 Bad Request`: Validation failure (e.g. `hour` < 0 or > 23, missing mandatory fields)
- `503 Service Unavailable`: Model artifact is not yet trained or loaded into the service runtime.
