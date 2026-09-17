# Evaluation Metrics Specification

## The Core Problem: Why Accuracy Alone is Misleading

In cybercrime and ATM fraud hotspot alerting, incident events are **naturally rare and highly imbalanced** (e.g., 95–99% of ATMs operate normally during any given observation window, while only 1–5% experience fraud or cyber incidents).

> [!WARNING]
> **The Accuracy Paradox**: A naive model that predicts `0` (Normal) for 100% of cases would achieve **95–99% accuracy**, yet catch **zero cybercrime incidents**. Therefore, the blueprint explicitly mandates that this hotspot-alerting problem must **not** be evaluated by accuracy alone.

---

## The 5 Authoritative Evaluation Metrics

We measure model performance across five complementary metrics:

| Metric | Focus | Why It Matters for Cybercrime Hotspot Alerting |
|---|---|---|
| **Precision** | Alert Reliability | Measures the proportion of predicted fraud alerts that are actual fraud incidents: $\frac{TP}{TP + FP}$. Minimizes alert fatigue and avoids sending investigators/police on false goose chases. |
| **Recall** | Incident Coverage | Measures the proportion of actual crimes captured by the system: $\frac{TP}{TP + FN}$. Directly reflects the system's ability to protect vulnerable ATMs and prevent cash-out losses. |
| **F1-Score** | Harmonic Balance | The harmonic mean of Precision and Recall: $2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$. Balances detection coverage with alert cleanliness. |
| **ROC-AUC** | Global Discrimination | Area under the Receiver Operating Characteristic curve. Measures model separation ability across all possible operating thresholds ($0.0 \to 1.0$). |
| **PR-AUC** | Rare Event Optimization | Area under the Precision-Recall curve (Average Precision). Specifically sensitive to the positive fraud minority class; standard gold standard for highly skewed distributions. |

---

## Operational Trade-Offs

```text
               High Precision               High Recall
          (Conservative Alerting)       (Aggressive Alerting)
          ┌─────────────────────┐       ┌─────────────────────┐
          │ Few false alarms    │       │ Most crimes caught  │
          │ Misses edge cases   │       │ More false alarms   │
          └─────────────────────┘       └─────────────────────┘
                             ▲             ▲
                             └──────┬──────┘
                                    │
                                 F1 & PR-AUC
                             (Optimal Equilibrium)
```

1. **Threshold Tuning**:
   - The model output probability allows operators to tune risk thresholds (e.g., `CRITICAL` at $\ge 80$, `HIGH` at $\ge 60$) depending on available law enforcement resources.
2. **Benchmark Reporting**:
   - Every model in the progression (Logistic Regression $\to$ Random Forest $\to$ XGBoost) is evaluated across these five metrics in `src/evaluation.py`.
