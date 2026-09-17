"""Phase 1: Synthetic Dataset Generator for Cybercrime Predictive Analytics.

Generates the 4 primary relational CSV datasets defined in the blueprint data architecture:
data/raw/
├── banks.csv        (10 Banks)
├── atms.csv         (500 ATMs, linked to Bank and District location)
├── transactions.csv (30,000 Transactions, linked to ATM and Account)
└── complaints.csv   (10,000 Complaints, linked to ATM and Incident Activity)
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")


# 1. Banks Catalog (10 Primary Commercial Banks)
BANK_MASTER = [
    {"bank_id": "BANK01", "bank_name": "State Bank of India", "hq": "Mumbai", "fraud_helpline": "1800-11-2211"},
    {"bank_id": "BANK02", "bank_name": "HDFC Bank", "hq": "Mumbai", "fraud_helpline": "1800-202-6161"},
    {"bank_id": "BANK03", "bank_name": "ICICI Bank", "hq": "Mumbai", "fraud_helpline": "1800-1080"},
    {"bank_id": "BANK04", "bank_name": "Punjab National Bank", "hq": "New Delhi", "fraud_helpline": "1800-180-2222"},
    {"bank_id": "BANK05", "bank_name": "Axis Bank", "hq": "Mumbai", "fraud_helpline": "1800-419-5959"},
    {"bank_id": "BANK06", "bank_name": "Bank of Baroda", "hq": "Vadodara", "fraud_helpline": "1800-258-4455"},
    {"bank_id": "BANK07", "bank_name": "Kotak Mahindra Bank", "hq": "Mumbai", "fraud_helpline": "1800-209-0000"},
    {"bank_id": "BANK08", "bank_name": "Canara Bank", "hq": "Bengaluru", "fraud_helpline": "1800-425-0018"},
    {"bank_id": "BANK09", "bank_name": "Union Bank of India", "hq": "Mumbai", "fraud_helpline": "1800-22-2244"},
    {"bank_id": "BANK10", "bank_name": "IndusInd Bank", "hq": "Pune", "fraud_helpline": "1860-267-7777"}
]

# Districts configuration for realistic spatial distribution & clustering
DISTRICT_CONFIG = [
    {"district_id": "DIST01", "name": "Central Financial District", "lat": 18.9322, "lon": 72.8311, "risk_mult": 2.4, "tier": "Metro Hub"},
    {"district_id": "DIST02", "name": "South Harbor Commercial", "lat": 18.9100, "lon": 72.8250, "risk_mult": 1.8, "tier": "Commercial"},
    {"district_id": "DIST03", "name": "North Tech Corridor", "lat": 19.1136, "lon": 72.8697, "risk_mult": 2.8, "tier": "Tech Hub"},
    {"district_id": "DIST04", "name": "East Industrial Zone", "lat": 19.0728, "lon": 72.8987, "risk_mult": 2.2, "tier": "Industrial"},
    {"district_id": "DIST05", "name": "West Coast Suburban", "lat": 19.0544, "lon": 72.8402, "risk_mult": 1.2, "tier": "Residential"},
    {"district_id": "DIST06", "name": "Old City Market", "lat": 18.9568, "lon": 72.8335, "risk_mult": 3.1, "tier": "Dense Commercial"},
    {"district_id": "DIST07", "name": "Airport Transit Zone", "lat": 19.0896, "lon": 72.8656, "risk_mult": 2.0, "tier": "Transit"},
    {"district_id": "DIST08", "name": "Railway Terminal Hub", "lat": 19.0178, "lon": 72.8478, "risk_mult": 3.4, "tier": "Transit Hub"},
    {"district_id": "DIST09", "name": "University Campus District", "lat": 19.0760, "lon": 72.8777, "risk_mult": 0.8, "tier": "Institutional"},
    {"district_id": "DIST10", "name": "South Suburban Enclave", "lat": 18.9800, "lon": 72.8100, "risk_mult": 0.6, "tier": "Residential"},
    {"district_id": "DIST11", "name": "Midtown Retail Strip", "lat": 19.0020, "lon": 72.8320, "risk_mult": 1.6, "tier": "Commercial"},
    {"district_id": "DIST12", "name": "North Suburban Gateway", "lat": 19.1765, "lon": 72.8611, "risk_mult": 1.9, "tier": "Suburban"},
    {"district_id": "DIST13", "name": "Outer Ring Road East", "lat": 19.1250, "lon": 72.9300, "risk_mult": 2.5, "tier": "Highway Corridor"},
    {"district_id": "DIST14", "name": "Outer Ring Road West", "lat": 19.1550, "lon": 72.8250, "risk_mult": 1.4, "tier": "Suburban"},
    {"district_id": "DIST15", "name": "Port & Logistics Area", "lat": 18.9450, "lon": 72.8550, "risk_mult": 1.5, "tier": "Logistics"},
    {"district_id": "DIST16", "name": "Civic Center District", "lat": 18.9400, "lon": 72.8350, "risk_mult": 0.7, "tier": "Government"},
    {"district_id": "DIST17", "name": "Wholesale Market Yard", "lat": 19.0350, "lon": 72.8600, "risk_mult": 2.7, "tier": "High Cash Flow"},
    {"district_id": "DIST18", "name": "Greenwood Residential", "lat": 19.0600, "lon": 72.8200, "risk_mult": 0.5, "tier": "Low Crime Residential"},
    {"district_id": "DIST19", "name": "Lake View Hills", "lat": 19.1300, "lon": 72.9100, "risk_mult": 0.7, "tier": "Low Crime Residential"},
    {"district_id": "DIST20", "name": "Highway Bypass Outpost", "lat": 19.2100, "lon": 72.8700, "risk_mult": 2.9, "tier": "Isolated Highway"}
]


def generate_banks_dataset() -> pd.DataFrame:
    """Generate 10 primary banks dataset (banks.csv)."""
    return pd.DataFrame(BANK_MASTER)


def generate_atms_dataset(df_banks: pd.DataFrame, num_atms: int = 500) -> pd.DataFrame:
    """Generate 500 ATMs dataset (atms.csv) linked to bank_id and district location."""
    location_types = ["Commercial", "Transit Hub", "Residential", "Standalone Highway", "Bank Branch Lobby"]
    location_weights = [0.35, 0.20, 0.25, 0.10, 0.10]
    
    bank_ids = df_banks["bank_id"].tolist()
    district_weights = [d["risk_mult"] for d in DISTRICT_CONFIG]
    district_weights = np.array(district_weights) / sum(district_weights)
    
    atms = []
    for i in range(1, num_atms + 1):
        atm_id = f"ATM{1000 + i}"
        dist = np.random.choice(DISTRICT_CONFIG, p=district_weights)
        bank_id = random.choice(bank_ids)
        
        # Jitter within ~1.5 km
        lat_jitter = float(np.random.normal(0, 0.012))
        lon_jitter = float(np.random.normal(0, 0.012))
        loc_type = str(np.random.choice(location_types, p=location_weights))
        
        is_isolated = loc_type == "Standalone Highway"
        hotspot_prob = min(0.75, (dist["risk_mult"] / 4.0) * (1.6 if is_isolated else 1.0))
        is_hotspot = 1 if random.random() < hotspot_prob else 0

        atms.append({
            "atm_id": atm_id,
            "bank_id": bank_id,
            "district_id": dist["district_id"],
            "district_name": dist["name"],
            "latitude": round(dist["lat"] + lat_jitter, 5),
            "longitude": round(dist["lon"] + lon_jitter, 5),
            "location_type": loc_type,
            "installed_year": random.randint(2018, 2024),
            "is_hotspot_terminal": is_hotspot,
            "daily_footfall": int(np.random.normal(350, 80)) if not is_isolated else int(np.random.normal(120, 30))
        })
    return pd.DataFrame(atms)


def generate_transactions_dataset(
    df_atms: pd.DataFrame, 
    num_txns: int = 30000,
    start_date: datetime = datetime(2026, 1, 1),
    days_span: int = 60
) -> pd.DataFrame:
    """Generate 30,000 transactions dataset (transactions.csv) linked to ATM and Account."""
    atm_records = df_atms.set_index("atm_id").to_dict(orient="index")
    atm_ids = list(atm_records.keys())

    # Pre-generate unique accounts and mule accounts
    account_pool = [f"ACC{100000 + i}" for i in range(8000)]
    mule_account_pool = [f"ACC_MULE_{2000 + i}" for i in range(150)]

    atm_weights = [1.8 if atm_records[a]["is_hotspot_terminal"] == 1 else 1.0 for a in atm_ids]
    atm_weights = np.array(atm_weights) / sum(atm_weights)

    target_fraud_count = int(num_txns * 0.055) # ~5.5% fraud rate
    fraud_indices = set(random.sample(range(num_txns), target_fraud_count))

    txns = []
    for i in range(num_txns):
        txn_id = f"TXN{i+1:06d}"
        is_fraud = 1 if i in fraud_indices else 0

        if is_fraud:
            hotspot_atms = [a for a in atm_ids if atm_records[a]["is_hotspot_terminal"] == 1]
            chosen_atm = random.choice(hotspot_atms) if hotspot_atms and random.random() < 0.80 else np.random.choice(atm_ids, p=atm_weights)
            account_id = random.choice(mule_account_pool) if random.random() < 0.70 else random.choice(account_pool)
            # Fraudulent transactions cluster during off-hours (22:00 - 05:00)
            hour = random.choice([22, 23, 0, 1, 2, 3, 4]) if random.random() < 0.70 else random.randint(5, 21)
            amount = random.choice([8000, 10000, 15000, 20000, 25000])
            status = "SUCCESS" if random.random() < 0.85 else "FAILED_LIMIT_EXCEEDED"
            failed_pins = int(np.random.choice([0, 1, 2, 3], p=[0.40, 0.30, 0.20, 0.10]))
        else:
            chosen_atm = np.random.choice(atm_ids, p=atm_weights)
            account_id = random.choice(account_pool)
            hour = int(np.random.normal(14, 3.5)) % 24
            amount = int(np.random.choice([500, 1000, 1500, 2000, 3000, 4000, 5000, 10000], 
                                          p=[0.14, 0.22, 0.12, 0.20, 0.12, 0.08, 0.08, 0.04]))
            status = "SUCCESS" if random.random() < 0.95 else "FAILED_INSUFFICIENT_FUNDS"
            failed_pins = int(np.random.choice([0, 1], p=[0.95, 0.05]))

        random_day = random.uniform(0, days_span)
        txn_dt = start_date + timedelta(days=random_day, hours=hour, minutes=random.randint(0, 59), seconds=random.randint(0, 59))

        txns.append({
            "transaction_id": txn_id,
            "timestamp": txn_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "atm_id": chosen_atm,
            "bank_id": atm_records[chosen_atm]["bank_id"],
            "account_id": account_id,
            "transaction_type": "WITHDRAWAL",
            "amount": amount,
            "status": status,
            "failed_pin_attempts": failed_pins,
            "is_fraud": is_fraud
        })

    df_txns = pd.DataFrame(txns).sort_values(by="timestamp").reset_index(drop=True)
    return df_txns


def generate_complaints_dataset(
    df_txns: pd.DataFrame, 
    df_atms: pd.DataFrame, 
    num_complaints: int = 10000
) -> pd.DataFrame:
    """Generate 10,000 complaints dataset (complaints.csv) linked to ATM and Incident Activity."""
    categories = [
        "Unauthorized ATM Cash Withdrawal",
        "Card Skimming / Clone Fraud",
        "ATM Cash Dispense Failure / Trapping",
        "PIN Shoulder Surfing & Theft",
        "Phishing & OTP Coerced Cash-out"
    ]
    weights = [0.45, 0.25, 0.12, 0.08, 0.10]
    
    atm_records = df_atms.set_index("atm_id").to_dict(orient="index")
    fraud_txns = df_txns[df_txns["is_fraud"] == 1]
    atm_ids = list(atm_records.keys())

    complaints = []
    
    # 65% linked directly to actual fraudulent transaction activity with realistic reporting delay
    linked_count = min(int(num_complaints * 0.65), len(fraud_txns))
    sampled_frauds = fraud_txns.sample(n=linked_count, replace=True, random_state=SEED)

    for idx, (_, f_row) in enumerate(sampled_frauds.iterrows(), start=1):
        fraud_dt = datetime.strptime(f_row["timestamp"], "%Y-%m-%d %H:%M:%S")
        delay_hrs = float(np.random.lognormal(mean=1.8, sigma=0.75))
        comp_dt = fraud_dt + timedelta(hours=delay_hrs)

        complaints.append({
            "complaint_id": f"CMP{idx:06d}",
            "timestamp": comp_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "atm_id": f_row["atm_id"],
            "bank_id": f_row["bank_id"],
            "account_id": f_row["account_id"],
            "category": np.random.choice(categories, p=weights),
            "amount_disputed": f_row["amount"],
            "is_verified_fraud": 1,
            "status": random.choice(["REGISTERED", "UNDER_INVESTIGATION", "RESOLVED"])
        })

    # 35% unlinked / general citizen portal reports
    min_date = datetime.strptime(df_txns["timestamp"].min(), "%Y-%m-%d %H:%M:%S")
    max_date = datetime.strptime(df_txns["timestamp"].max(), "%Y-%m-%d %H:%M:%S")
    total_seconds = int((max_date - min_date).total_seconds())

    for j in range(linked_count + 1, num_complaints + 1):
        random_sec = random.randint(0, total_seconds)
        comp_dt = min_date + timedelta(seconds=random_sec)
        chosen_atm = random.choice(atm_ids)

        complaints.append({
            "complaint_id": f"CMP{j:06d}",
            "timestamp": comp_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "atm_id": chosen_atm,
            "bank_id": atm_records[chosen_atm]["bank_id"],
            "account_id": f"ACC{np.random.randint(100000, 999999)}",
            "category": np.random.choice(categories, p=weights),
            "amount_disputed": int(np.random.choice([1000, 2000, 3000, 5000, 10000, 15000, 20000])),
            "is_verified_fraud": int(random.random() < 0.40),
            "status": random.choice(["REGISTERED", "UNDER_INVESTIGATION", "CLOSED"])
        })

    df_complaints = pd.DataFrame(complaints).sort_values(by="timestamp").reset_index(drop=True)
    return df_complaints


def run_generation():
    """Main execution to produce the 4 primary CSV datasets."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating 4 Primary Datasets...")

    print("1. Creating banks.csv...")
    df_banks = generate_banks_dataset()
    df_banks.to_csv(os.path.join(OUTPUT_DIR, "banks.csv"), index=False)

    print("2. Creating atms.csv...")
    df_atms = generate_atms_dataset(df_banks, num_atms=500)
    df_atms.to_csv(os.path.join(OUTPUT_DIR, "atms.csv"), index=False)

    print("3. Creating transactions.csv...")
    df_txns = generate_transactions_dataset(df_atms, num_txns=30000)
    df_txns.to_csv(os.path.join(OUTPUT_DIR, "transactions.csv"), index=False)

    print("4. Creating complaints.csv...")
    df_complaints = generate_complaints_dataset(df_txns, df_atms, num_complaints=10000)
    df_complaints.to_csv(os.path.join(OUTPUT_DIR, "complaints.csv"), index=False)

    print("\nGeneration successfully complete!")
    print(f"- banks.csv:        {len(df_banks):,} records")
    print(f"- atms.csv:         {len(df_atms):,} records")
    print(f"- transactions.csv: {len(df_txns):,} records (fraud rate: {df_txns['is_fraud'].mean()*100:.2f}%)")
    print(f"- complaints.csv:   {len(df_complaints):,} records")


if __name__ == "__main__":
    run_generation()
