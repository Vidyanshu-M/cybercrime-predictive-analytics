# Feature Engineering Specification: Three Core Groups

As defined in the **ML Strategy** section of the project blueprint, the cybercrime and ATM fraud risk predictive analytics model relies on three fundamental feature categories:

---

## 1. Temporal Features
Captures cyclic human activity rhythms, off-hour vulnerabilities, and rolling temporal velocity metrics across immediate (1h), medium (6h), and daily (24h) horizons.

| Feature Name | Type | Description |
|---|---|---|
| `hour` | `int` (`0–23`) | Hour of the day when the transaction or telemetry snapshot occurred. |
| `day_of_week` | `int` (`0–6`) | Day of the week (`0` = Monday, `6` = Sunday). |
| `is_weekend` | `int` (`0` or `1`) | Binary flag indicating weekend (`Saturday` or `Sunday`). |
| `complaints_last_1h` | `int` | Count of customer/citizen complaints filed within the preceding 1 hour. |
| `complaints_last_6h` | `int` | Count of complaints filed within the preceding 6 hours. |
| `complaints_last_24h` | `int` | Count of complaints filed within the preceding 24 hours. |
| `withdrawals_last_1h` | `int` | Cash withdrawal transaction count at this ATM in the last 1 hour. |
| `withdrawals_last_6h` | `int` | Cash withdrawal transaction count at this ATM in the last 6 hours. |
| `withdrawals_last_24h` | `int` | Cash withdrawal transaction count at this ATM in the last 24 hours. |

---

## 2. Spatial Features
Measures geographic clustering, proximity to known crime occurrences, and historical ATM/neighborhood vulnerability.

| Feature Name | Type | Description |
|---|---|---|
| `fraud_events_1km` | `int` | Verified fraudulent incidents recorded within a 1 km radius. |
| `fraud_events_3km` | `int` | Verified fraudulent incidents recorded within a 3 km radius. |
| `complaints_1km` | `int` | Citizen reports/complaints reported within a 1 km radius. |
| `complaints_3km` | `int` | Citizen reports/complaints reported within a 3 km radius. |
| `distance_from_recent_fraud` | `float` | Distance (in km) to the most recently detected fraudulent incident. |
| `historical_hotspot_score` | `float` | Normalized empirical hotspot index (`0.0` to `1.0` or frequency density). |

---

## 3. Financial / Activity Features
Detects monetary anomalies, cash-out patterns, account multiplexing, and rapid successive transactions indicative of skimming or mule operations.

| Feature Name | Type | Description |
|---|---|---|
| `withdrawal_count` | `int` | Number of withdrawal attempts during the evaluation window. |
| `total_withdrawal_amount` | `float` | Total monetary sum withdrawn during the evaluation window. |
| `average_withdrawal` | `float` | Mean monetary amount per withdrawal transaction. |
| `unique_accounts` | `int` | Number of distinct account numbers/cards observed at the terminal. |
| `transaction_velocity` | `float` | Transactions per minute or rate of change in volume. |

---

## Code Reference
In the codebase, these groups are defined in [`src/feature_engineering.py`](file:///d:/kH/kaya-iitbhu%20Project/Application/ML/ml-service/src/feature_engineering.py):
- `TEMPORAL_FEATURES`
- `SPATIAL_FEATURES`
- `FINANCIAL_ACTIVITY_FEATURES`
- `FEATURE_GROUPS`
- `ALL_MODEL_FEATURES`
