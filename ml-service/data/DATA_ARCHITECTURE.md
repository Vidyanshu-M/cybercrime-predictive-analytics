# Phase 1: Data Architecture & Relational Schema

This document details the relational architecture of the **4 primary CSV datasets** in `data/raw/` as specified in the project blueprint:

---

## 1. Relational Architecture Diagram

```text
       ┌────────────────────────┐
       │       banks.csv        │
       │ (10 Commercial Banks)  │
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│     atms.csv     │  │   (ACCOUNTS)     │
│    (500 ATMs)    │  │ (Unique Holders) │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         │        ┌────────────┘
         │        │
         ▼        ▼
┌─────────────────────────────────┐
│        transactions.csv         │
│     (30,000 Transaction Logs)   │
└────────────────┬────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
   LOCATION METRICS / ACTIVITY
                 │
                 ▼
┌─────────────────────────────────┐
│         complaints.csv          │
│    (10,000 Citizen Reports)     │
└─────────────────────────────────┘
```

---

## 2. Dataset Schemas & Foreign Keys

### 1. `data/raw/banks.csv` (10 rows)
Primary entity representing banking institutions operating terminals.
- **`bank_id`** (PK): Unique bank identifier (`BANK01` to `BANK10`).
- **`bank_name`**: Formal institution name (e.g., *State Bank of India*, *HDFC Bank*).
- **`hq`**: Corporate headquarter city.
- **`fraud_helpline`**: Designated customer fraud contact number.

### 2. `data/raw/atms.csv` (500 rows)
Physical ATM terminal assets distributed across 20 districts.
- **`atm_id`** (PK): Unique ATM identifier (`ATM1001` to `ATM1500`).
- **`bank_id`** (FK $\to$ `banks.bank_id`): The owning/servicing bank.
- **`district_id`**: Assigned district identifier (`DIST01` to `DIST20`).
- **`district_name`**: Urban/regional zone name.
- **`latitude`**, **`longitude`**: Geographic GPS coordinates.
- **`location_type`**: Setting classification (`Commercial`, `Transit Hub`, `Residential`, `Standalone Highway`, `Bank Branch Lobby`).
- **`installed_year`**: Year terminal was commissioned (2018–2024).
- **`is_hotspot_terminal`**: Binary flag indicating historically elevated vulnerability.
- **`daily_footfall`**: Estimated daily visitor volume.

### 3. `data/raw/transactions.csv` (30,000 rows)
Financial transaction stream over a 60-day observation window.
- **`transaction_id`** (PK): Unique transaction identifier (`TXN000001` to `TXN030000`).
- **`timestamp`**: Datetime of transaction occurrence (`YYYY-MM-DD HH:MM:SS`).
- **`atm_id`** (FK $\to$ `atms.atm_id`): Terminal where the transaction was attempted.
- **`bank_id`** (FK $\to$ `banks.bank_id`): Terminal sponsor bank.
- **`account_id`**: Originating customer card/account identifier.
- **`transaction_type`**: Operation category (e.g., `WITHDRAWAL`).
- **`amount`**: Monetary value withdrawn (₹500 to ₹25,000).
- **`status`**: Execution status (`SUCCESS`, `FAILED_LIMIT_EXCEEDED`, `FAILED_INSUFFICIENT_FUNDS`).
- **`failed_pin_attempts`**: Count of preceding incorrect PIN attempts.
- **`is_fraud`**: Ground-truth indicator (1 for fraudulent/mule cash-out, 0 for legitimate).

### 4. `data/raw/complaints.csv` (10,000 rows)
Citizen and portal reports filed regarding suspected unauthorized activity.
- **`complaint_id`** (PK): Unique incident ticket (`CMP000001` to `CMP010000`).
- **`timestamp`**: Datetime when the complaint was formally registered.
- **`atm_id`** (FK $\to$ `atms.atm_id`): Terminal associated with the grievance.
- **`bank_id`** (FK $\to$ `banks.bank_id`): Affected financial institution.
- **`account_id`**: Impacted customer account.
- **`category`**: Nature of grievance (`Unauthorized ATM Cash Withdrawal`, `Card Skimming / Clone Fraud`, `ATM Cash Dispense Failure / Trapping`, `PIN Shoulder Surfing & Theft`, `Phishing & OTP Coerced Cash-out`).
- **`amount_disputed`**: Disputed loss amount.
- **`is_verified_fraud`**: Binary validation status.
- **`status`**: Ticket lifecycle state (`REGISTERED`, `UNDER_INVESTIGATION`, `RESOLVED`, `CLOSED`).
