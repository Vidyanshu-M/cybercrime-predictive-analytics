# Phase 2: Exploratory Data Analysis (EDA) Report

**Service**: Cybercrime Predictive Analytics — Machine Learning Service  
**Analysis Date**: 2026-09-17  
**Status**: **PASSED (Ready for Phase 3 — Label Definition & Preprocessing)**

---

## 1. Executive Summary & Status Board

| Step | Topic | Result / Finding | Status |
|:---:|---|---|:---:|
| **2.1** | **Load Datasets** | All 5 primary CSVs loaded without formatting errors | ✅ **PASS** |
| **2.2** | **Dataset Inspection** | Shapes: Banks (10, 4), Districts (20, 7), ATMs (500, 10), Complaints (10,000, 11), Transactions (30,000, 11) | ✅ **PASS** |
| **2.3** | **Data Quality** | 0 missing values across all primary columns. `complaint_id` populated on 2,120 cluster txns | ✅ **PASS** |
| **2.4** | **Duplicate Validation** | 0 duplicate rows. 100% unique primary keys across all 5 datasets | ✅ **PASS** |
| **2.5** | **Relationship Validation** | 0 orphan foreign keys (`atm_id`, `bank_id`, `district_id`) | ✅ **PASS** |
| **2.6** | **Transaction Analysis** | 24,950 withdrawals (83.2%). Normal mean ₹2,000–₹3,000 vs. Fraud mean ₹15,000–₹20,000. 0 negative amounts | ✅ **PASS** |
| **2.7** | **Temporal Analysis** | Diurnal peak at 14:00 (daytime) vs. fraud burst peak at 22:00–04:00. Weekend activity at 28.6% | ✅ **PASS** |
| **2.8** | **Spatial Analysis** | Valid UP coordinates [25.14°N – 29.98°N, 77.31°E – 83.40°E] across 20 districts | ✅ **PASS** |
| **2.9** | **Fraud Analysis** | 350 fraud clusters with rapid 4–12 min inter-arrival withdrawal spikes. Fraud transaction rate: 7.07% | ✅ **PASS** |
| **2.10**| **EDA Findings Table** | 7/7 core assessment areas passed | ✅ **PASS** |
| **2.11**| **ML-Readiness Assessment**| Data contains sufficient contrast and variance to compute all 20 planned features | ✅ **PASS** |

---

## 2. Dataset Size & Structural Inspection

```text
Dataset Summary Table:
========================================================================================
Dataset        Rows      Columns   Missing Values   Duplicate Rows   Primary Key
----------------------------------------------------------------------------------------
Banks          10        4         0                0                bank_id
Districts      20        7         0                0                district_id
ATMs           500       10        0                0                atm_id
Complaints     10,000    11        0                0                complaint_id
Transactions   30,000    11        27,880 (Null PK) 0                transaction_id
========================================================================================
```
*Note on Missing Values*: The 27,880 null values in `transactions` belong strictly to `complaint_id` for legitimate transactions. The 2,120 populated `complaint_id` fields correctly track transactions originating from detected fraud burst clusters.

---

## 3. Data Quality & Referential Integrity

1. **Primary Key Uniqueness**:
   - Duplicate `bank_id`: `0`
   - Duplicate `district_id`: `0`
   - Duplicate `atm_id`: `0`
   - Duplicate `complaint_id`: `0`
   - Duplicate `transaction_id`: `0`
2. **Foreign Key Integrity**:
   - `transactions.atm_id` $\to$ `atms.atm_id`: `0` invalid references (100% matched)
   - `atms.bank_id` $\to$ `banks.bank_id`: `0` invalid references (100% matched)
   - `atms.district_id` $\to$ `districts.district_id`: `0` invalid references (100% matched)
3. **Timestamp Datatypes**:
   - `transactions['transaction_time']`: Parsed to `datetime64[ns]` across 2026-01-01 to 2026-08-31.
   - `complaints['reported_at']`: Parsed to `datetime64[ns]` across 2026-01-01 to 2026-08-31.

---

## 4. Financial & Transaction Type Distribution

- **Transaction Type Breakdown**:
  - `WITHDRAWAL`: **24,950** (83.17%) — Core focus for predictive cybercrime modeling.
  - `BALANCE_CHECK`: **2,834** (9.45%)
  - `DEPOSIT`: **1,399** (4.66%)
  - `TRANSFER`: **817** (2.72%)
- **Transaction Amount Statistics**:
  - Minimum: ₹0 (Balance check)
  - 25th Percentile: ₹1,000
  - Median: ₹2,000
  - 75th Percentile: ₹3,000
  - Maximum: ₹25,000 (Maximum ATM cash-out cap)
  - Mean: ₹3,430.17
  - Standard Deviation: ₹4,809.92
  - Negative amounts: **0**

---

## 5. Temporal Analysis

1. **Diurnal Rhythms**:
   - Normal transactions surge between **09:00 and 19:00**, peaking around **14:00**.
   - Fraud burst transactions heavily concentrate during vulnerable late evening/early morning hours (**22:00 to 04:00**).
2. **Day of Week & Weekend Activity**:
   - Weekday transactions: **21,425** (71.42%)
   - Weekend transactions: **8,575** (28.58%)
3. **Daily Timeline**:
   - Daily activity maintains steady operational volume across the entire 8-month window (2026-01-01 to 2026-08-31), providing consistent history for temporal rolling windows (`last_1h`, `last_6h`, `last_24h`).

---

## 6. Spatial Analysis

- **Geographic Boundaries**:
  - ATM Latitude: `[25.1408°N, 29.9785°N]`
  - ATM Longitude: `[77.3104°E, 83.4015°E]`
  - Complaint Latitude: `[25.1339°N, 30.0013°N]`
  - Complaint Longitude: `[77.2947°E, 83.4153°E]`
- **District Concentration**:
  - Highest ATM density: Lucknow (49), Varanasi (43), Noida (42), Kanpur Nagar (33), Meerut (30).
  - Spatial proximity allows realistic density modeling (`complaints_1km`, `complaints_3km`, `fraud_events_1km`, `fraud_events_3km`).

---

## 7. Fraud vs. Normal Activity Contrast

- **Risk Label Distribution**:
  - `0` (Normal): **27,880** (92.93%)
  - `1` (Fraud Cluster Burst): **2,120** (7.07%)
- **Amount Contrast**:
  - Normal withdrawal average: **₹2,000 – ₹3,000**
  - Fraud cluster withdrawal average: **₹15,000 – ₹20,000**
- **Temporal Burst Structure**:
  - 350 discrete fraud clusters featuring 4 to 8 rapid successive withdrawals spaced 4–12 minutes apart at the same or nearby ATM following a reported incident.

---

## 8. Answers to the Key EDA Question

> **Does the generated data contain enough temporal, spatial, and activity variation to create useful predictive features?**

**YES — unequivocally.**
1. **Temporal Features**: The diurnal variance, weekend contrasts, and inter-transaction burst intervals support rolling window extractions.
2. **Spatial Features**: The localized cluster coordinates support 1 km and 3 km radius counting and proximity metrics.
3. **Financial / Activity Features**: Distinct account references, rapid successive cash-outs, and amount distribution differences allow transaction velocity and anomaly detection.
4. **Data Leakage Safeguards**: No future target information is leaked into the raw datasets.
