# Model Progression Strategy

We follow a disciplined, staged model progression pipeline rather than jumping directly to XGBoost. This ensures every incremental layer of complexity is scientifically justified against baseline benchmarks.

---

## 1. Architectural Progression Workflow

```text
                 ┌────────────────────┐
                 │  Feature Dataset   │
                 └─────────┬──────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        Logistic       Random Forest   XGBoost
       Regression       Comparison     Primary
        (Baseline)                     (Candidate)
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    Model Evaluation
                           │
                           ▼
                  SHAP Explainability
                      (Optional)
```

---

## 2. Model Roles & Rationale

| Model | Progression Role | Purpose & Rationale |
|---|---|---|
| **Logistic Regression** | **Baseline** | Establishes minimum viable performance threshold. Fast to train, highly interpretable, provides linear coefficient validation. |
| **Random Forest** | **Comparison** | First non-linear ensemble benchmark. Tests tree-based bagging, feature interactions, and robustness against outliers without boosting complexity. |
| **XGBoost** | **Primary Model** | State-of-the-art gradient boosted decision trees. Optimizes non-linear boundaries, handles sparsity, and targets maximal Precision / Recall / ROC-AUC for fraud detection. |
| **SHAP** | **Optional Explainability** | Model interpretability layer. Computes Shapley values (TreeExplainer) to explain individual ATM risk scores for investigatory transparency. |

---

## 3. Evaluation & Comparison Metrics

All models in the progression are benchmarked against identical train/test splits (`src/evaluation.py`):

1. **F1-Score (Macro / Fraud Class)**: Balancing false alarms with missed cybercrime incidents.
2. **Precision & Recall**: Ensuring law enforcement / security teams aren't overwhelmed with false positives while catching true frauds.
3. **ROC-AUC & PR-AUC**: Essential for evaluating class-imbalanced fraud distributions.
4. **Inference Latency**: Validating millisecond response times required by the backend API.

---

## 4. Code Implementation

- **Model Training & Comparison**: Defined in [`src/train.py`](file:///d:/kH/kaya-iitbhu%20Project/Application/ML/ml-service/src/train.py) (`train_model`, `compare_progression_models`).
- **Evaluation Utilities**: Defined in [`src/evaluation.py`](file:///d:/kH/kaya-iitbhu%20Project/Application/ML/ml-service/src/evaluation.py).
- **Interpretability Module**: Defined in [`src/explain.py`](file:///d:/kH/kaya-iitbhu%20Project/Application/ML/ml-service/src/explain.py).
