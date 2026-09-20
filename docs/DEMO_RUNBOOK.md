# Cybercrime Predictive Analytics — Hackathon Live Demo Runbook

> **Executive Summary**: An end-to-end geospatial cybercrime intelligence and early-warning platform that predicts ATM fraud bursts **before** cash-outs occur, using a hardened **XGBoost (`xgb-v1`)** machine learning engine, **PostGIS** spatial buffers, **Spring Boot** real-time event orchestration, and an interactive **React** tactical command dashboard.

---

## 1. System Architecture Overview

```
                      +---------------------------------------+
                      |       React 18 + Vite Frontend        |
                      |        http://localhost:3000          |
                      |   Tactical Command & Officer Hub      |
                      +-------------------+-------------------+
                                          |
                        REST (/api)       |   STOMP WebSocket (/ws)
                                          |   /topic/alerts
                                          v
                      +-------------------+-------------------+
                      |        Spring Boot 3.3.0 Core         |
                      |        http://localhost:8080          |
                      |   MlFeatureService | AlertService    |
                      |   PredictionService| MapService       |
                      +---------+-------------------+---------+
                                |                   |
                 JPA / Spatial  |                   | HTTP REST
                 Queries (21)   |                   | POST /predict
                                v                   v
        +-----------------------+----+   +----------+-----------------------+
        |  PostgreSQL 16 + PostGIS   |   |   Python FastAPI ML Engine       |
        |   localhost:5432           |   |   http://127.0.0.1:8000          |
        |   Database: cybercrime_db  |   |   Model: xgb-v1 (Frozen)         |
        |   - 17 Relational Tables   |   |   - 21 Features Engine           |
        |   - ST_Buffer Spatial Risk |   |   - 180-Minute Prediction Horizon|
        +----------------------------+   +----------------------------------+
```

---

## 2. 3–5 Minute Live Presentation Flow

### Phase 1: Problem Statement & Architecture Pitch (45 Seconds)
- **Hook**: *"Cybercrime mule syndicates exploit ATM networks for rapid cash-outs after phishing/SIM-swap attacks. By the time victims report the crime, the money is gone."*
- **Solution**: *"CyberTrace predicts ATM withdrawal spikes 3 hours in advance using spatial-temporal machine learning, automatically establishing surveillance perimeters and dispatching tactical alerts."*
- **Architecture Callout**: Show the live dashboard running at `http://localhost:3000`. Highlight that the dashboard is connected to a live Spring Boot backend, a real PostgreSQL/PostGIS database, and a dedicated Python FastAPI inference engine.

---

### Phase 2: High-Risk Scenario — Fraud Burst Prediction (90 Seconds)
1. **Target Selection**:
   - On the **Command & Control Dashboard**, click the **"Run Prediction"** button in the top right banner.
   - In the modal, select **State Bank of India (ATM1023) - Connaught Place Outer Circle**.
   - Note the **Prediction Window Horizon**: `180 Minutes (3 Hours)`.
2. **Execute Model Inference**:
   - Click **"Execute Model Inference"**.
   - **What happens under the hood (explain during inference)**:
     1. Spring Boot's `MlFeatureService` executes 21 spatial, temporal, and transaction queries in PostgreSQL.
     2. A 21-feature payload is dispatched to FastAPI `/predict`.
     3. The frozen XGBoost model calculates probability.
     4. Spring Boot converts probability into risk score, generates a PostGIS buffer polygon, creates an alert, and dispatches a STOMP broadcast.
3. **Inspect Prediction Result**:
   - Point out the verified fields:
     - **Model Version**: `xgb-v1`
     - **Probability**: `99.82% (0.99817)`
     - **Risk Score**: `100 / 100` (`CRITICAL`)
     - **Window**: `180 min (3h Horizon)`
     - **Explainable Reasons**:
       - *Nearby complaint activity: 4 complaints in last 24h*
       - *Recent fraud activity: 2 fraud events within 3km*
       - *Recent fraud activity detected within 1km*
       - *ATM is inside a risk zone with hotspot score 100*

---

### Phase 3: Spatial RiskZone & Real-Time Alert Broadcast (60 Seconds)
1. **RiskZone Map Visualization**:
   - Close the modal.
   - Point to the interactive **Predictive Risk Map** on the dashboard.
   - Show the newly generated **PostGIS Polygon buffer** ($\approx 800\text{ m}$ radius) surrounding ATM1023 in Connaught Place.
   - Click the polygon to show the risk score (100%), critical badge, and 3-hour surveillance window.
2. **Real-Time WebSocket Delivery**:
   - Notice the **AlertToast** notification that appeared on screen without any browser refresh.
   - Notice the **Pending Command Alerts** counter incremented dynamically via the STOMP `/topic/alerts` feed.

---

### Phase 4: Officer Investigation Workflow (45 Seconds)
1. **Navigate to Alerts**:
   - Click **"View All Incident Alerts"** or navigate to `/alerts`.
2. **Acknowledge Alert**:
   - Click **"Acknowledge"** on the newly created ATM1023 alert.
   - Show the status transition from `NEW` $\rightarrow$ `ACKNOWLEDGED` with official timestamp.
3. **Assign Officer**:
   - Click **"Assign"** on the alert.
   - Select **Inspector Vikram Roy** (State Cyber Cell) and confirm.
   - Show the status transition to `ASSIGNED` with designated officer attribution.
   - Point out that all actions are persisted in PostgreSQL and logged via audit aspect.

---

### Phase 5: Normal Baseline Comparison & Threshold Safety (30 Seconds)
1. **Select Low-Risk ATM**:
   - Return to the Dashboard and click **"Run Prediction"**.
   - Select **ICICI Bank (ATM1025) - Koramangala 5th Block, Bengaluru Urban**.
2. **Execute Inference**:
   - **Probability**: `0.37% (0.003734)`
   - **Risk Score**: `0 / 100` (`LOW`)
   - **Result**: Normal baseline.
3. **Threshold Precision Argument**:
   - *"Notice that because the predicted risk ($P = 0.003734$, score 0) remained well below the application's alert threshold (score 60), **no alert was generated and no risk zone was created**. The system reserves tactical dispatch and alerts strictly for elevated spatial-temporal fraud bursts."*

---

### Phase 6: Model Validation Metrics & Closing (30 Seconds)
- Switch to presentation slide / metrics summary (see Section 4 below).
- Conclude with the ethical framework: *"CyberTrace provides proactive **decision-support** for law enforcement patrol and bank ATM cash-management, not automated accusations."*

---

## 3. Key Concepts & Presentation Distinctions

### ML Probability vs. Application Risk Score
- **XGBoost Output**: The trained `xgb-v1` model computes a raw continuous probability $P(\text{Fraud Burst} \mid \mathbf{x}) \in [0.0, 1.0]$.
- **Risk Score**: The application scales and calibrates this into an intuitive $0\text{--}100$ integer score for law enforcement officers:
  $$\text{Risk Score} = \text{round}(P \times 100)$$
- **Risk Classification Levels**:
  - `0 – 39`: **LOW** (Normal baseline activity)
  - `40 – 59`: **MEDIUM** (Elevated monitoring recommended)
  - `60 – 79`: **HIGH** (Spatial RiskZone buffer generated, patrol alert dispatched)
  - `80 – 100`: **CRITICAL** (Urgent tactical perimeter created, priority alert broadcast)

### Ethical & Legal Guardrails
1. **Decision Support**: The system flags spatial-temporal risk anomalies to prioritize police patrolling and bank cash-management—it does **not** assert individual guilt or replace human judgment.
2. **Explainability**: Every prediction presents human-interpretable observation reasons (complaint density, withdrawal velocity burst, spatial clustering) rather than a black-box score.
3. **Dataset Scope & Claim Boundaries**:
   > [!IMPORTANT]
   > All reported metrics are evaluated strictly on the project's **synthetic/anonymized temporal holdout test set**. These numbers validate model architecture, feature engineering, and calibration under controlled benchmark conditions. They must **not** be presented as empirical proof that the exact same performance metrics will be achieved immediately on uncalibrated, real-world municipal police feeds without localized retraining and calibration.

---

## 4. Frozen ML Evaluation Metrics (Cheat-Sheet)

All metrics are officially verified on the **untouched temporal holdout test set** ($N = 4,500$ time-split records, 188 positive fraud bursts, 4.18% base rate, date range `2026-07-25` to `2026-08-31`):

| Metric | Score | Industry Interpretation |
| :--- | :---: | :--- |
| **ROC-AUC** | **99.77%** (`0.9977`) | Exceptional global discriminative ability between normal ATM windows and fraud spikes. |
| **PR-AUC** | **95.30%** (`0.9530`) | Outstanding performance under severe class imbalance (4.18% positive rate). |
| **Accuracy** | **98.89%** (`0.9889`) | High overall correctness across all test time windows. |
| **F1 Score** | **86.77%** (`0.8677`) | Balanced harmonic mean of precision and recall at the 0.50 operating threshold. |
| **Precision** | **86.32%** (`0.8632`) | When the model predicts a fraud burst, it is correct 86.32% of the time (minimizes false alarms). |
| **Recall** | **87.23%** (`0.8723`) | The model successfully intercepts 87.23% of all simulated fraud cash-out events. |

### Test Set Confusion Matrix ($N = 4,500$)
- **True Negatives**: `4,286` (Clean ATM hours correctly classified as safe)
- **True Positives**: `164` (Imminent fraud bursts successfully intercepted)
- **False Positives**: `26` (Precautionary patrols dispatched)
- **False Negatives**: `24` (Missed events)
- **Data Isolation**: `test_set_used_only_for_final_evaluation: true`, `no_training_performed_on_test_data: true`, `no_hyperparameter_tuning_performed_on_test_data: true`.

---

## 5. Quickstart & Service Management Guide

### Single-Command Startup
To start the entire stack idempotently:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```
*Note: If services are already running, `start-all.ps1` detects them automatically and avoids launching duplicate processes.*

### Health Verification
To inspect all four system tiers:
```powershell
powershell -ExecutionPolicy Bypass -File .\health-check.ps1
```

### Clean Teardown
To gracefully stop all services after the demo:
```powershell
powershell -ExecutionPolicy Bypass -File .\stop-all.ps1
```

---

## 6. Demo URLs & Credentials

| Service | URL | Default Credentials |
| :--- | :--- | :--- |
| **Officer Dashboard** | `http://localhost:3000` | N/A (Directly accessible) |
| **Spring Boot API** | `http://localhost:8080/api` | `admin@cybertrace.gov.in` / `password123` |
| **Swagger API Docs** | `http://localhost:8080/swagger-ui.html` | Public |
| **FastAPI ML Service** | `http://127.0.0.1:8000/docs` | Public (`/health`, `/predict`) |
| **PostgreSQL / PostGIS**| `127.0.0.1:5432/cybercrime_db` | `postgres` / `Vidya1@@` |
