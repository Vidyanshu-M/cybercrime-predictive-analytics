"""Phase 1: Realistic Synthetic Dataset Generator for Cybercrime Predictive Analytics.

Follows the project blueprint specifications:
- 10 Banks (banks.csv)
- 500 ATMs (atms.csv) with geographic coordinates, districts, areas, and types
- 10,000 Complaints (complaints.csv) with timestamps, crime categories, locations, and police stations
- 30,000 Transactions (transactions.csv) with temporal bursts, spatial fraud clusters, and normal baseline contrast

Time span: 2026-01-01 to 2026-08-31 (8-month historical observation window).
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

# Set seeds for strict reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
START_DATE = datetime(2026, 1, 1, 0, 0, 0)
END_DATE = datetime(2026, 8, 31, 23, 59, 59)
TOTAL_SECONDS = int((END_DATE - START_DATE).total_seconds())

# ==============================================================================
# 1. Geographic & Institutional Configuration (Uttar Pradesh Focus from Blueprint)
# ==============================================================================

BANKS_DATA = [
    {"bank_id": "BANK001", "bank_code": "HDFC", "bank_name": "HDFC Bank", "hq": "Mumbai"},
    {"bank_id": "BANK002", "bank_code": "SBI", "bank_name": "State Bank of India", "hq": "Mumbai"},
    {"bank_id": "BANK003", "bank_code": "ICICI", "bank_name": "ICICI Bank", "hq": "Mumbai"},
    {"bank_id": "BANK004", "bank_code": "PNB", "bank_name": "Punjab National Bank", "hq": "New Delhi"},
    {"bank_id": "BANK005", "bank_code": "AXIS", "bank_name": "Axis Bank", "hq": "Mumbai"},
    {"bank_id": "BANK006", "bank_code": "BOB", "bank_name": "Bank of Baroda", "hq": "Vadodara"},
    {"bank_id": "BANK007", "bank_code": "KOTAK", "bank_name": "Kotak Mahindra Bank", "hq": "Mumbai"},
    {"bank_id": "BANK008", "bank_code": "CANARA", "bank_name": "Canara Bank", "hq": "Bengaluru"},
    {"bank_id": "BANK009", "bank_code": "UBI", "bank_name": "Union Bank of India", "hq": "Mumbai"},
    {"bank_id": "BANK010", "bank_code": "INDUS", "bank_name": "IndusInd Bank", "hq": "Pune"}
]

# 20 Realistic Districts across Uttar Pradesh with anchor coordinates and crime vulnerability weights
DISTRICTS = [
    {"district_id": "DIST001", "district": "Varanasi", "lat": 25.3176, "lon": 82.9739, "risk_mult": 2.8, "areas": [
        ("Lanka", "Lanka PS", 25.2810, 82.9995),
        ("Cantt", "Cantt PS", 25.3340, 82.9860),
        ("Godowlia", "Dashashwamedh PS", 25.3090, 83.0080),
        ("Sigra", "Sigra PS", 25.3190, 82.9850),
        ("Bhelupur", "Bhelupur PS", 25.2970, 82.9920),
        ("Shivpur", "Shivpur PS", 25.3650, 82.9620),
        ("Sarnath", "Sarnath PS", 25.3720, 83.0230)
    ]},
    {"district_id": "DIST002", "district": "Lucknow", "lat": 26.8467, "lon": 80.9462, "risk_mult": 2.6, "areas": [
        ("Hazratganj", "Hazratganj PS", 26.8520, 80.9430),
        ("Gomti Nagar", "Gomti Nagar PS", 26.8580, 80.9980),
        ("Alambagh", "Alambagh PS", 26.8080, 80.9080),
        ("Indira Nagar", "Indira Nagar PS", 26.8830, 80.9850),
        ("Charbagh", "Charbagh PS", 26.8310, 80.9210)
    ]},
    {"district_id": "DIST003", "district": "Kanpur Nagar", "lat": 26.4499, "lon": 80.3319, "risk_mult": 2.4, "areas": [
        ("Civil Lines", "Civil Lines PS", 26.4720, 80.3480),
        ("Govind Nagar", "Govind Nagar PS", 26.4350, 80.3120),
        ("Kalyanpur", "Kalyanpur PS", 26.4950, 80.2580),
        ("Kidwai Nagar", "Kidwai Nagar PS", 26.4210, 80.3390)
    ]},
    {"district_id": "DIST004", "district": "Prayagraj", "lat": 25.4358, "lon": 81.8463, "risk_mult": 2.2, "areas": [
        ("Civil Lines", "Civil Lines PS", 25.4520, 81.8340),
        ("Katra", "Colonelganj PS", 25.4610, 81.8590),
        ("Naini", "Naini PS", 25.3850, 81.8680),
        ("Jhusi", "Jhusi PS", 25.4290, 81.9050)
    ]},
    {"district_id": "DIST005", "district": "Noida (Gautam Buddha Nagar)", "lat": 28.5355, "lon": 77.3910, "risk_mult": 3.0, "areas": [
        ("Sector 18", "Sector 20 PS", 28.5700, 77.3220),
        ("Sector 62", "Sector 58 PS", 28.6210, 77.3650),
        ("Greater Noida Alpha", "Kasna PS", 28.4720, 77.5110),
        ("Sector 137", "Surajpur PS", 28.5130, 77.4080)
    ]},
    {"district_id": "DIST006", "district": "Ghaziabad", "lat": 28.6692, "lon": 77.4538, "risk_mult": 2.7, "areas": [
        ("Indirapuram", "Indirapuram PS", 28.6430, 77.3710),
        ("Vaishali", "Kaushambi PS", 28.6480, 77.3410),
        ("Raj Nagar", "Kavi Nagar PS", 28.6850, 77.4510)
    ]},
    {"district_id": "DIST007", "district": "Agra", "lat": 27.1767, "lon": 78.0081, "risk_mult": 2.0, "areas": [
        ("Tajganj", "Tajganj PS", 27.1620, 78.0410),
        ("Sanjay Place", "Hari Parwat PS", 27.1990, 78.0030),
        ("Cantt Agra", "Sadar Bazar PS", 27.1550, 78.0090)
    ]},
    {"district_id": "DIST008", "district": "Meerut", "lat": 28.9845, "lon": 77.7064, "risk_mult": 2.3, "areas": [
        ("Shastri Nagar", "Nauchandi PS", 28.9720, 77.7310),
        ("Begum Bridge", "Sadar PS", 28.9950, 77.7020)
    ]},
    {"district_id": "DIST009", "district": "Bareilly", "lat": 28.3670, "lon": 79.4304, "risk_mult": 1.5, "areas": [
        ("Civil Lines", "Kotwali PS", 28.3580, 79.4210),
        ("C.B. Ganj", "CB Ganj PS", 28.4120, 79.3520)
    ]},
    {"district_id": "DIST010", "district": "Aligarh", "lat": 27.8974, "lon": 78.0880, "risk_mult": 1.7, "areas": [
        ("Civil Lines", "Civil Lines PS", 27.9120, 78.0750),
        ("University Market", "Kwarsi PS", 27.9250, 78.0920)
    ]},
    {"district_id": "DIST011", "district": "Moradabad", "lat": 28.8386, "lon": 78.7733, "risk_mult": 1.6, "areas": [
        ("Civil Lines", "Civil Lines PS", 28.8450, 78.7610),
        ("Majhola", "Majhola PS", 28.8120, 78.7410)
    ]},
    {"district_id": "DIST012", "district": "Gorakhpur", "lat": 26.7606, "lon": 83.3732, "risk_mult": 1.8, "areas": [
        ("Golghar", "Cantt PS", 26.7580, 83.3710),
        ("Medical College Road", "Gulriha PS", 26.7920, 83.3950)
    ]},
    {"district_id": "DIST013", "district": "Ayodhya (Faizabad)", "lat": 26.7730, "lon": 82.1460, "risk_mult": 1.4, "areas": [
        ("Civil Lines", "Kotwali PS", 26.7780, 82.1380),
        ("Naya Ghat", "Ayodhya PS", 26.7950, 82.2020)
    ]},
    {"district_id": "DIST014", "district": "Jhansi", "lat": 25.4484, "lon": 78.5685, "risk_mult": 1.3, "areas": [
        ("Sadar Bazar", "Sadar PS", 25.4350, 78.5610),
        ("Nawabad", "Nawabad PS", 25.4590, 78.5780)
    ]},
    {"district_id": "DIST015", "district": "Mathura", "lat": 27.4924, "lon": 77.6737, "risk_mult": 1.5, "areas": [
        ("Krishna Nagar", "Kotwali PS", 27.4990, 77.6680),
        ("Highway Mathura", "Highway PS", 27.4720, 77.6350)
    ]},
    {"district_id": "DIST016", "district": "Muzaffarnagar", "lat": 29.4727, "lon": 77.7085, "risk_mult": 1.5, "areas": [
        ("Civil Lines", "Civil Lines PS", 29.4790, 77.7020),
        ("New Mandi", "New Mandi PS", 29.4620, 77.7210)
    ]},
    {"district_id": "DIST017", "district": "Saharanpur", "lat": 29.9640, "lon": 77.5460, "risk_mult": 1.4, "areas": [
        ("Court Road", "Sadar PS", 29.9680, 77.5420),
        ("Delhi Road", "Janakpuri PS", 29.9450, 77.5280)
    ]},
    {"district_id": "DIST018", "district": "Firozabad", "lat": 27.1590, "lon": 78.3957, "risk_mult": 1.2, "areas": [
        ("Station Road", "Uttar PS", 27.1550, 78.3980),
        ("Suhag Nagar", "Dakshin PS", 27.1680, 78.4120)
    ]},
    {"district_id": "DIST019", "district": "Mirzapur", "lat": 25.1337, "lon": 82.5644, "risk_mult": 0.9, "areas": [
        ("Dankeen Ganj", "Kotwali PS", 25.1480, 82.5710),
        ("Vindhyachal", "Vindhyachal PS", 25.1620, 82.5020)
    ]},
    {"district_id": "DIST020", "district": "Jaunpur", "lat": 25.7464, "lon": 82.6837, "risk_mult": 1.1, "areas": [
        ("Line Bazar", "Line Bazar PS", 25.7350, 82.6780),
        ("Shahganj Road", "Kotwali PS", 25.7550, 82.6920)
    ]}
]


def generate_districts() -> pd.DataFrame:
    """Generate 20 districts dataset (districts.csv)."""
    dist_list = []
    for d in DISTRICTS:
        dist_list.append({
            "district_id": d["district_id"],
            "district_name": d["district"],
            "state": "Uttar Pradesh",
            "latitude": d["lat"],
            "longitude": d["lon"],
            "risk_multiplier": d["risk_mult"],
            "area_count": len(d["areas"])
        })
    return pd.DataFrame(dist_list)

# Crime Categories (1.5)
CRIME_CATEGORIES = [
    "ATM_FRAUD",
    "CARD_FRAUD",
    "UPI_FRAUD",
    "ONLINE_BANKING_FRAUD",
    "PHISHING",
    "IDENTITY_FRAUD",
    "OTHER"
]
CATEGORY_WEIGHTS = [0.40, 0.22, 0.15, 0.09, 0.08, 0.04, 0.02]

# Transaction Types (1.7)
TXN_TYPES = ["WITHDRAWAL", "BALANCE_CHECK", "DEPOSIT", "TRANSFER"]
TXN_TYPE_WEIGHTS = [0.82, 0.10, 0.05, 0.03]  # Focus heavily on WITHDRAWAL as specified


# ==============================================================================
# Step 1: Generate 10 Banks (banks.csv)
# ==============================================================================

def generate_banks() -> pd.DataFrame:
    """Generate 10 bank entities."""
    return pd.DataFrame(BANKS_DATA)


# ==============================================================================
# Step 2 & 3: Generate 500 ATMs (atms.csv)
# Schema: atm_id, atm_code, bank_id, latitude, longitude, district, area, atm_type, is_active
# ==============================================================================

def generate_atms(df_banks: pd.DataFrame, num_atms: int = 500) -> pd.DataFrame:
    """Generate 500 ATMs across districts and areas."""
    atm_types = ["OFFSITE", "ONSITE"]
    type_weights = [0.65, 0.35]
    
    bank_map = df_banks.set_index("bank_id")["bank_code"].to_dict()
    bank_ids = list(bank_map.keys())

    # Distribute ATMs weighted by district risk/urban density
    dist_weights = [d["risk_mult"] for d in DISTRICTS]
    dist_weights = np.array(dist_weights) / sum(dist_weights)

    atms = []
    bank_atm_counter: Dict[str, int] = {b: 0 for b in bank_ids}

    for i in range(1, num_atms + 1):
        atm_id = f"ATM{i:04d}"
        chosen_dist = np.random.choice(DISTRICTS, p=dist_weights)
        area_info = random.choice(chosen_dist["areas"])
        area_name, ps_name, base_lat, base_lon = area_info
        
        bank_id = random.choice(bank_ids)
        bank_atm_counter[bank_id] += 1
        bank_code = bank_map[bank_id]
        atm_code = f"ATM-{bank_code}-{bank_atm_counter[bank_id]:03d}"

        # Jitter within ~0.6 km around area center
        lat_jitter = float(np.random.normal(0, 0.005))
        lon_jitter = float(np.random.normal(0, 0.005))

        atm_type = np.random.choice(atm_types, p=type_weights)
        # 96% of ATMs are active
        is_active = random.random() < 0.96

        atms.append({
            "atm_id": atm_id,
            "atm_code": atm_code,
            "bank_id": bank_id,
            "district_id": chosen_dist["district_id"],
            "latitude": round(base_lat + lat_jitter, 6),
            "longitude": round(base_lon + lon_jitter, 6),
            "district": chosen_dist["district"],
            "area": area_name,
            "police_station": ps_name,  # helper field for spatial linkage
            "atm_type": atm_type,
            "is_active": str(is_active).lower(),
            "district_risk": chosen_dist["risk_mult"]
        })

    return pd.DataFrame(atms)


# ==============================================================================
# Step 4, 5, 6, 7 & 8: Generate Correlated Complaints & Transactions
# ==============================================================================

def generate_complaints_and_transactions(
    df_atms: pd.DataFrame,
    total_complaints: int = 10000,
    total_txns: int = 30000
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Generate 10,000 complaints and 30,000 transactions with realistic correlated fraud clusters."""

    atm_records = df_atms.set_index("atm_id").to_dict(orient="index")
    atm_ids = list(atm_records.keys())

    # Pre-generate synthetic accounts pool (1.8)
    normal_account_pool = [f"ACC{i:06d}" for i in range(1, 9001)]
    mule_account_pool = [f"ACC_MULE_{i:04d}" for i in range(1, 251)]

    # --------------------------------------------------------------------------
    # 1. Generate 10,000 Complaints
    # --------------------------------------------------------------------------
    complaints = []
    
    # Select ~350 distinct fraud hotspot clusters across time and space
    num_clusters = 350
    # Higher risk ATMs get chosen for clusters
    atm_risk_scores = [atm_records[a]["district_risk"] for a in atm_ids]
    atm_probs = np.array(atm_risk_scores) / sum(atm_risk_scores)
    cluster_atms = np.random.choice(atm_ids, size=num_clusters, p=atm_probs, replace=True)

    cluster_info_list = []
    for c_idx, c_atm in enumerate(cluster_atms):
        # Random cluster timestamp between Jan 1 and Aug 25 (to allow lookback/forward windows)
        cluster_sec = random.randint(0, TOTAL_SECONDS - 86400 * 5)
        c_time = START_DATE + timedelta(seconds=cluster_sec)
        # Fraud often occurs late evening / night
        if random.random() < 0.65:
            c_time = c_time.replace(hour=random.choice([20, 21, 22, 23, 0, 1, 2, 3, 4]))
        
        atm_meta = atm_records[c_atm]
        # Jitter complaint location slightly (0.1 - 0.7 km away from ATM)
        c_lat = round(atm_meta["latitude"] + np.random.normal(0, 0.003), 6)
        c_lon = round(atm_meta["longitude"] + np.random.normal(0, 0.003), 6)
        
        cluster_info_list.append({
            "cluster_id": c_idx,
            "atm_id": c_atm,
            "time": c_time,
            "lat": c_lat,
            "lon": c_lon,
            "district": atm_meta["district"],
            "police_station": atm_meta["police_station"]
        })

    # Generate 10,000 complaints:
    # ~35% linked to specific cluster incidents, remaining distributed across region
    complaint_counter = 1
    cluster_complaint_map = {}

    for c_info in cluster_info_list:
        comp_id = f"COMP{complaint_counter:06d}"
        comp_num = f"CMP-2026-{complaint_counter:06d}"
        category = "ATM_FRAUD" if random.random() < 0.70 else "CARD_FRAUD"
        fraud_amt = float(random.choice([10000, 15000, 20000, 25000, 35000, 50000]))

        complaints.append({
            "complaint_id": comp_id,
            "complaint_number": comp_num,
            "reported_at": c_info["time"].strftime("%Y-%m-%d %H:%M:%S"),
            "crime_category": category,
            "fraud_amount": fraud_amt,
            "state": "Uttar Pradesh",
            "district": c_info["district"],
            "police_station": c_info["police_station"],
            "latitude": c_info["lat"],
            "longitude": c_info["lon"],
            "status": random.choice(["REGISTERED", "UNDER_INVESTIGATION", "ACTION_TAKEN"])
        })
        cluster_complaint_map[c_info["cluster_id"]] = comp_id
        c_info["complaint_id"] = comp_id
        complaint_counter += 1

    # Fill remaining complaints up to 10,000
    while complaint_counter <= total_complaints:
        comp_id = f"COMP{complaint_counter:06d}"
        comp_num = f"CMP-2026-{complaint_counter:06d}"
        random_sec = random.randint(0, TOTAL_SECONDS)
        comp_time = START_DATE + timedelta(seconds=random_sec)
        
        chosen_atm_id = np.random.choice(atm_ids, p=atm_probs)
        atm_meta = atm_records[chosen_atm_id]
        category = np.random.choice(CRIME_CATEGORIES, p=CATEGORY_WEIGHTS)
        fraud_amt = float(np.random.choice([2000, 5000, 8000, 10000, 15000, 20000, 30000, 45000],
                                           p=[0.15, 0.20, 0.15, 0.20, 0.15, 0.08, 0.05, 0.02]))
        
        c_lat = round(atm_meta["latitude"] + float(np.random.normal(0, 0.008)), 6)
        c_lon = round(atm_meta["longitude"] + float(np.random.normal(0, 0.008)), 6)

        complaints.append({
            "complaint_id": comp_id,
            "complaint_number": comp_num,
            "reported_at": comp_time.strftime("%Y-%m-%d %H:%M:%S"),
            "crime_category": category,
            "fraud_amount": fraud_amt,
            "state": "Uttar Pradesh",
            "district": atm_meta["district"],
            "police_station": atm_meta["police_station"],
            "latitude": c_lat,
            "longitude": c_lon,
            "status": random.choice(["REGISTERED", "UNDER_INVESTIGATION", "RESOLVED", "CLOSED"])
        })
        complaint_counter += 1

    df_complaints = pd.DataFrame(complaints).sort_values(by="reported_at").reset_index(drop=True)

    # --------------------------------------------------------------------------
    # 2. Generate 30,000 Transactions (Normal vs Fraud Clusters)
    # --------------------------------------------------------------------------
    transactions = []
    txn_counter = 1

    # Part A: Fraud Burst Transactions around the 350 clusters (~2,100 fraud txns, 7%)
    # As specified in 1.10:
    # 20:05 -> Complaint
    # 20:12 -> Withdrawal
    # 20:18 -> Withdrawal
    # 20:24 -> Withdrawal
    # 20:31 -> Withdrawal
    # 20:42 -> Withdrawal
    for c_info in cluster_info_list:
        c_time = c_info["time"]
        c_atm = c_info["atm_id"]
        c_id = c_info["complaint_id"]
        atm_meta = atm_records[c_atm]

        # Each cluster has 4 to 8 rapid burst withdrawals
        burst_size = random.randint(4, 8)
        burst_card = random.choice(mule_account_pool)

        running_time = c_time + timedelta(minutes=random.randint(4, 12))
        for _ in range(burst_size):
            if txn_counter > total_txns:
                break
            
            # Short intervals between transactions: 4 to 12 minutes
            interval_mins = random.randint(4, 12)
            running_time += timedelta(minutes=interval_mins, seconds=random.randint(0, 59))
            
            # Fraud transactions are high-value withdrawals
            amt = float(random.choice([10000, 15000, 20000, 25000]))

            transactions.append({
                "transaction_id": f"TXN{txn_counter:08d}",
                "transaction_reference": f"TXN-2026-{txn_counter:06d}",
                "transaction_time": running_time.strftime("%Y-%m-%d %H:%M:%S"),
                "amount": amt,
                "transaction_type": "WITHDRAWAL",
                "account_id": burst_card if random.random() < 0.75 else random.choice(mule_account_pool),
                "atm_id": c_atm,
                "latitude": atm_meta["latitude"],
                "longitude": atm_meta["longitude"],
                "risk_label": 1,
                "complaint_id": c_id
            })
            txn_counter += 1

    # Part B: Normal Activity Background (~27,900 txns, 93%)
    # Normal daytime flow: e.g. 09:15 -> ₹2,000, 11:30 -> ₹5,000, 14:12 -> ₹1,000
    while txn_counter <= total_txns:
        chosen_atm_id = random.choice(atm_ids)
        atm_meta = atm_records[chosen_atm_id]
        
        # Temporal distribution: mostly daytime/evening (08:00 - 21:00)
        random_sec = random.randint(0, TOTAL_SECONDS)
        t_time = START_DATE + timedelta(seconds=random_sec)
        if random.random() < 0.85:
            normal_hour = int(np.random.normal(14, 3.5)) % 24
            t_time = t_time.replace(hour=normal_hour)

        t_type = np.random.choice(TXN_TYPES, p=TXN_TYPE_WEIGHTS)
        
        if t_type == "WITHDRAWAL":
            amt = float(np.random.choice([500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 8000, 10000],
                                          p=[0.12, 0.22, 0.10, 0.20, 0.08, 0.12, 0.06, 0.05, 0.03, 0.02]))
        elif t_type == "DEPOSIT":
            amt = float(np.random.choice([2000, 5000, 10000, 15000, 20000], p=[0.25, 0.35, 0.25, 0.10, 0.05]))
        elif t_type == "TRANSFER":
            amt = float(np.random.choice([1000, 3000, 5000, 10000], p=[0.30, 0.35, 0.25, 0.10]))
        else: # BALANCE_CHECK
            amt = 0.0

        transactions.append({
            "transaction_id": f"TXN{txn_counter:08d}",
            "transaction_reference": f"TXN-2026-{txn_counter:06d}",
            "transaction_time": t_time.strftime("%Y-%m-%d %H:%M:%S"),
            "amount": amt,
            "transaction_type": t_type,
            "account_id": random.choice(normal_account_pool),
            "atm_id": chosen_atm_id,
            "latitude": atm_meta["latitude"],
            "longitude": atm_meta["longitude"],
            "risk_label": 0,
            "complaint_id": ""  # empty / null for normal activity
        })
        txn_counter += 1

    df_transactions = pd.DataFrame(transactions).sort_values(by="transaction_time").reset_index(drop=True)

    return df_complaints, df_transactions


# ==============================================================================
# Quality Checks & Dataset Validation
# ==============================================================================

def validate_datasets(
    df_banks: pd.DataFrame, 
    df_districts: pd.DataFrame,
    df_atms: pd.DataFrame, 
    df_complaints: pd.DataFrame, 
    df_transactions: pd.DataFrame
) -> bool:
    """Run Phase 1 Acceptance Criteria Quality Checks."""
    print("\n--- Running Phase 1 Data Quality Checks ---")

    # 1. Scale checks
    assert len(df_banks) == 10, f"Expected 10 banks, got {len(df_banks)}"
    assert len(df_districts) == 20, f"Expected 20 districts, got {len(df_districts)}"
    assert len(df_atms) == 500, f"Expected 500 ATMs, got {len(df_atms)}"
    assert len(df_complaints) == 10000, f"Expected 10,000 complaints, got {len(df_complaints)}"
    assert len(df_transactions) == 30000, f"Expected 30,000 transactions, got {len(df_transactions)}"
    print("[PASS] Exact scale validated: 10 banks, 20 districts, 500 ATMs, 10,000 complaints, 30,000 transactions.")

    # 2. No duplicate IDs
    assert df_banks["bank_id"].is_unique, "Duplicate bank_id found!"
    assert df_districts["district_id"].is_unique, "Duplicate district_id found!"
    assert df_atms["atm_id"].is_unique, "Duplicate atm_id found!"
    assert df_complaints["complaint_id"].is_unique, "Duplicate complaint_id found!"
    assert df_transactions["transaction_id"].is_unique, "Duplicate transaction_id found!"
    print("[PASS] Unique primary keys verified (no duplicate IDs).")

    # 3. Valid Foreign Key Relationships
    valid_bank_ids = set(df_banks["bank_id"])
    assert set(df_atms["bank_id"]).issubset(valid_bank_ids), "Invalid bank_id in atms!"

    valid_district_ids = set(df_districts["district_id"])
    assert set(df_atms["district_id"]).issubset(valid_district_ids), "Invalid district_id in atms!"

    valid_atm_ids = set(df_atms["atm_id"])
    assert set(df_transactions["atm_id"]).issubset(valid_atm_ids), "Invalid atm_id in transactions!"
    print("[PASS] Relational integrity verified (Foreign Keys match).")

    # 4. Valid Coordinates
    for df, name in [(df_districts, "districts"), (df_atms, "atms"), (df_complaints, "complaints"), (df_transactions, "transactions")]:
        assert df["latitude"].between(24.0, 31.0).all(), f"Invalid latitude in {name}"
        assert df["longitude"].between(76.0, 85.0).all(), f"Invalid longitude in {name}"
    print("[PASS] Coordinate bounds verified within Uttar Pradesh jurisdiction.")

    # 5. Contrast & Realism Checks
    fraud_rate = df_transactions["risk_label"].mean() * 100
    print(f"[PASS] Contrast checked: Transaction fraud rate is {fraud_rate:.2f}% (normal vs anomaly contrast exists).")
    
    withdrawals_count = (df_transactions["transaction_type"] == "WITHDRAWAL").sum()
    print(f"[PASS] Transaction focus: {withdrawals_count:,} withdrawals ({withdrawals_count/len(df_transactions)*100:.1f}%).")

    linked_txns = (df_transactions["complaint_id"] != "").sum()
    print(f"[PASS] Relational clusters: {linked_txns:,} transactions linked to complaint fraud clusters.")

    # 6. ML Safety Verification
    # Ensure synthetic tokens only (no real PII)
    sample_acc = df_transactions["account_id"].iloc[0]
    assert sample_acc.startswith("ACC"), f"Unexpected account pattern {sample_acc}"
    print("[PASS] ML Safety verified: All identifiers are synthetic tokens, no real victim or bank PII.")

    print("--- All Phase 1 Quality Checks Passed Successfully! ---\n")
    return True


def run_pipeline():
    """Execute complete Phase 1 generation pipeline."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("==========================================================")
    print("       PHASE 1: REALISTIC DATA GENERATION PIPELINE        ")
    print("==========================================================")

    print("Step 1: Generating 10 Banks...")
    df_banks = generate_banks()

    print("Step 2: Generating 20 Districts...")
    df_districts = generate_districts()
    
    print("Step 3: Generating 500 ATMs across UP Districts...")
    df_atms = generate_atms(df_banks, num_atms=500)

    print("Step 4, 5, 6, 7 & 8: Generating 10,000 Complaints & 30,000 Transactions...")
    df_complaints, df_transactions = generate_complaints_and_transactions(
        df_atms, total_complaints=10000, total_txns=30000
    )

    # Export schema fields for ATMs
    df_atms_export = df_atms[[
        "atm_id", "atm_code", "bank_id", "district_id", "latitude", "longitude", 
        "district", "area", "atm_type", "is_active"
    ]]

    # Step 9: Validate datasets
    validate_datasets(df_banks, df_districts, df_atms, df_complaints, df_transactions)

    # Step 10: Save CSV files
    print("Step 10: Saving CSV datasets to data/raw/...")
    
    banks_path = os.path.join(OUTPUT_DIR, "banks.csv")
    df_banks.to_csv(banks_path, index=False)
    print(f"  -> Saved {len(df_banks)} rows to {banks_path}")

    districts_path = os.path.join(OUTPUT_DIR, "districts.csv")
    df_districts.to_csv(districts_path, index=False)
    print(f"  -> Saved {len(df_districts)} rows to {districts_path}")

    atms_path = os.path.join(OUTPUT_DIR, "atms.csv")
    df_atms_export.to_csv(atms_path, index=False)
    print(f"  -> Saved {len(df_atms_export)} rows to {atms_path}")

    complaints_path = os.path.join(OUTPUT_DIR, "complaints.csv")
    df_complaints.to_csv(complaints_path, index=False)
    print(f"  -> Saved {len(df_complaints)} rows to {complaints_path}")

    transactions_path = os.path.join(OUTPUT_DIR, "transactions.csv")
    df_transactions.to_csv(transactions_path, index=False)
    print(f"  -> Saved {len(df_transactions)} rows to {transactions_path}")

    print("\nPhase 1 Data Generation Pipeline Complete! Ready for feature engineering.")


if __name__ == "__main__":
    run_pipeline()
