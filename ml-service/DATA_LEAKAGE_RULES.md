# Critical ML Rule: No Data Leakage

> [!CAUTION]
> **Cardinal Rule**: NEVER use information from the future prediction window to create features for that prediction.

---

## 1. Concrete Example: Prediction Window vs. Feature Window

Suppose we are predicting ATM cybercrime/fraud risk for the window:
$$\mathbf{20:00 \longrightarrow 23:00}$$

```text
                  FEATURE LOOKBACK WINDOW              PREDICTION WINDOW
        ──────────────────────────────────────────► │ ◄───────────────────►
  17:00       18:00       19:00       20:00 (T_cut) │ 21:00   22:00   23:00
    │           │           │               │       │   │       │       │
    ▼           ▼           ▼               ▼       │   ▼       ▼       ▼
 [Allowed Historical Activity]                     │ [Future Activity]
  • 19:00 withdrawal volume                         │ • 20:00-23:00 withdrawals
  • 18:00 complaints                                │ • 20:00-23:00 crimes
  • Previous 24h rolling activity                   │ • 20:00-23:00 alerts
  • Historical spatial fraud density                │
                                                    │
                 ✅ VALID FEATURES                  │   ❌ FORBIDDEN LEAKAGE
```

### Allowed Inputs (Historical Window: $t \le 20:00$):
- $19:00$ transaction activity
- $18:00$ incident reports
- Previous 24h rolling complaints & withdrawal frequency
- Historical spatial hotspot scores
- Distance to known past frauds ($t \le 20:00$)

### Forbidden Inputs (Future Prediction Window: $20:00 < t \le 23:00$):
- **Actual cash withdrawals between 20:00 and 23:00**
- Any complaints or customer calls logged after 20:00
- Transactions occurring during the forecasted window

> **Why this matters**: If future withdrawals or events are included as features, the model effectively receives the answer before making its prediction. This creates artificially inflated metrics during offline validation (e.g. 99% accuracy) that catastrophically collapses in live production.

---

## 2. Temporal Train / Test Separation

Standard random shuffling (`train_test_split(..., shuffle=True)`) is **strictly prohibited** for this predictive analytics pipeline.

```text
Random Shuffle (WRONG - LEAKS FUTURE DATA):
[Past] [Future] [Past] [Future] [Past] ──► Train & Test mixed

Time-Aware Separation (CORRECT):
[================= Historical Train Data =================] │ [==== Future Test ====]
Jan 1 ─────────────────────────────────────────────► Aug 31  │ Sept 1 ────────► Oct 31
                                                             ▲
                                                        Cutoff Date
```

1. **Chronological Ordering**: The dataset is strictly sorted by timestamp.
2. **Cutoff Separation**: The initial $80\%$ of chronological time is allocated for model training, and the remaining $20\%$ of future time is held out for test evaluation (`time_aware_train_test_split` in `src/preprocessing.py`).
3. **Rolling Window Aggregations**: All rolling aggregations (`last_1h`, `last_6h`, `last_24h`) must use strict right-closed or closed-left historical boundaries, never looking ahead.

---

## 3. Code References

- **Temporal Train/Test Split**: Implemented in [`src/preprocessing.py`](file:///d:/kH/kaya-iitbhu%20Project/Application/ML/ml-service/src/preprocessing.py) (`time_aware_train_test_split`).
- **Feature Definitions**: Documented in [`src/feature_engineering.py`](file:///d:/kH/kaya-iitbhu%20Project/Application/ML/ml-service/src/feature_engineering.py).
