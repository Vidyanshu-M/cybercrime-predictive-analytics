# Cybercrime Predictive Analytics — ML Service

This service provides real-time and batch machine learning capabilities for predicting cybercrime, ATM fraud hotspots, and anomalous cash-out operations.

---

## 1. Directory Structure

```text
ml-service/
│
├── data/
│   ├── raw/                 # Raw incident & telemetry datasets (.csv, .json)
│   └── processed/           # Feature-engineered and cleaned datasets
│
├── notebooks/
│   └── 01_data_generation.ipynb# Phase 1 dataset exploration & validation
│
├── src/
│   ├── __init__.py
│   ├── data_generator.py    # Phase 1 realistic synthetic dataset generator
│   ├── preprocessing.py     # Ingestion, cleaning, and time-aware splitting
│   ├── feature_engineering.py# Temporal, spatial, and financial features
│   ├── train.py             # Model progression (LogReg -> RF -> XGBoost)
│   ├── predict.py           # Inference wrapper and probability scoring
│   ├── evaluation.py        # Precision, Recall, F1, ROC-AUC, PR-AUC
│   ├── explain.py           # Feature importance & SHAP explainability
│   └── schemas.py           # Pydantic input/output contract schemas
│
├── models/                  # Trained model artifacts (.joblib, .pkl)
│
├── main.py                  # FastAPI server & CLI pipeline entrypoint
│
├── requirements.txt         # Project dependencies
│
├── .venv/                   # Python virtual environment (ignored in git)
│
├── CONTRACT.md              # Backend-to-ML integration contract
├── FEATURES.md              # The three feature groups definition
├── MODEL_STRATEGY.md        # Model progression architecture
├── EVALUATION_METRICS.md    # Precision, Recall, F1, ROC-AUC, PR-AUC
└── DATA_LEAKAGE_RULES.md    # Strict temporal separation & lookback rules
```

---

## 2. Conceptual ML Workflow

```text
               Problem Definition
                       │
                       ▼
             Binary Classification
     (0: Normal Terminal, 1: Crime/Fraud Risk)
                       │
                       ▼
            3-Hour Future Prediction
          (Forecasting t -> t + 3h)
                       │
                       ▼
    Temporal + Spatial + Financial Features
     (20 core features, strictly retrospective)
                       │
                       ▼
               Model Progression
       Logistic Regression (Baseline)
               ↓
       Random Forest (Comparison)
               ↓
       XGBoost (Primary Model)
               ↓
       SHAP Explainability (Optional)
                       │
                       ▼
         Model Output Transformation
         Probability (0.00 – 1.00)
               ↓
         Risk Score (0 – 100)
               ↓
         Risk Level (LOW / MEDIUM / HIGH / CRITICAL)
                       │
                       ▼
             FastAPI Serving Layer
              (POST /predict)
```

---

## 3. Phase 0 Checklist & Verification

| Item | Status | Details |
|---|:---:|---|
| **Git branch `feature/ml` created** | ✅ | Branch active and tracking `origin/feature/ml` |
| **`/ml-service` created** | ✅ | Dedicated service directory initialized |
| **Folder structure created** | ✅ | `data/`, `notebooks/`, `src/`, `models/` in place |
| **Python virtual environment created** | ✅ | Isolated Python 3.14 environment at `.venv/` |
| **Dependencies installed** | ✅ | `pandas`, `numpy`, `scikit-learn`, `xgboost`, `fastapi`, `jupyter`, etc. |
| **Prediction problem understood** | ✅ | Binary classification of ATM crime/fraud |
| **Target defined** | ✅ | 3-hour future incident occurrence |
| **Input contract understood** | ✅ | `MLPredictRequest` schema defined (`CONTRACT.md`) |
| **Output contract understood** | ✅ | `MLPredictResponse` (`probability`, `riskScore`, `riskLevel`, `modelVersion`) |
| **Risk levels defined** | ✅ | `LOW` (0–29), `MEDIUM` (30–59), `HIGH` (60–79), `CRITICAL` (80–100) |
| **Feature groups defined** | ✅ | Temporal (9), Spatial (6), Financial/Activity (5) in `FEATURES.md` |
| **Model progression defined** | ✅ | Logistic Regression $\to$ Random Forest $\to$ XGBoost in `MODEL_STRATEGY.md` |
| **Evaluation metrics defined** | ✅ | Precision, Recall, F1, ROC-AUC, PR-AUC in `EVALUATION_METRICS.md` |
| **Data leakage rule understood** | ✅ | Strict retrospective lookback + `time_aware_train_test_split` |

---

## 4. Phase 0 Status Sign-off

- **Architecture**: ✅ Completed
- **Folder structure**: ✅ Completed
- **ML objective**: ✅ Completed
- **Target**: ✅ Completed
- **API contract**: ✅ Completed
- **Model strategy**: ✅ Completed
- **Evaluation strategy**: ✅ Completed

---

## 5. Phase 1 Acceptance Criteria & Verification

| Criteria Area | Target / Rule | Verified Status |
|---|---|:---:|
| **Dataset Scale** | 10 banks, 500 ATMs, 10,000 complaints, 30,000 transactions | ✅ Exact match |
| **Data Quality** | No duplicate IDs, valid timestamps, valid coordinates within UP | ✅ Verified |
| **Referential Integrity** | Bank IDs match in ATMs; ATM IDs match in Transactions/Complaints | ✅ Verified |
| **Pattern Realism** | Normal background vs 350 temporal/spatial fraud clusters | ✅ Verified |
| **Transaction Focus** | Focus on `WITHDRAWAL` (83.2% of transactions) with burst activity | ✅ Verified |
| **Relational Clusters** | 2,120 transactions linked directly to complaint fraud clusters | ✅ Verified |
| **ML Safety** | 100% synthetic tokenized IDs (`ACC000001`), no real PII/victim data | ✅ Verified |
