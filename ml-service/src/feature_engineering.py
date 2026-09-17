"""Phase 4: Feature Engineering Pipeline.

Converts cleaned event data from Phase 3 into an ATM x Observation Time feature matrix.
Strictly adheres to the No-Leakage Rule:
At observation time T, only information occurring at or before T is used for feature construction.
The future 3-hour window (T to T+3h) is reserved exclusively for the prediction target.

Feature Groups:
1. Temporal (hour, day_of_week, is_weekend, complaints/withdrawals in past 1h, 6h, 24h)
2. Spatial (fraud events and complaints within 1km and 3km, distance from recent fraud, hotspot score)
3. Financial / Activity (withdrawal count, total amount, average amount, unique accounts, velocity)
"""

from pathlib import Path
from typing import Tuple, List, Dict, Optional, Any
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

# Paths
PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"
FEATURE_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"

# Constants
PREDICTION_WINDOW_HOURS = 3
EARTH_RADIUS_KM = 6371.0

# Feature Catalog
TEMPORAL_FEATURES: List[str] = [
    "hour",
    "day_of_week",
    "is_weekend",
    "complaints_last_1h",
    "complaints_last_6h",
    "complaints_last_24h",
    "withdrawals_last_1h",
    "withdrawals_last_6h",
    "withdrawals_last_24h"
]

SPATIAL_FEATURES: List[str] = [
    "fraud_events_1km",
    "fraud_events_3km",
    "complaints_1km",
    "complaints_3km",
    "distance_from_recent_fraud",
    "historical_hotspot_score"
]

FINANCIAL_ACTIVITY_FEATURES: List[str] = [
    "withdrawal_count",
    "total_withdrawal_amount",
    "average_withdrawal",
    "unique_accounts",
    "transaction_velocity"
]

FEATURE_GROUPS: Dict[str, List[str]] = {
    "temporal": TEMPORAL_FEATURES,
    "spatial": SPATIAL_FEATURES,
    "financial_activity": FINANCIAL_ACTIVITY_FEATURES
}

ALL_MODEL_FEATURES: List[str] = (
    TEMPORAL_FEATURES + SPATIAL_FEATURES + FINANCIAL_ACTIVITY_FEATURES
)


# 4.2 — Load Processed Data
def load_processed_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load cleaned datasets from data/processed/."""
    atms = pd.read_csv(PROCESSED_DIR / "atms.csv")
    complaints = pd.read_csv(PROCESSED_DIR / "complaints.csv")
    transactions = pd.read_csv(PROCESSED_DIR / "transactions.csv")

    complaints["timestamp"] = pd.to_datetime(complaints["timestamp"])
    transactions["timestamp"] = pd.to_datetime(transactions["timestamp"])

    return atms, complaints, transactions


# 4.3 — Observation Timestamps
def create_observation_times(transactions: pd.DataFrame) -> pd.DatetimeIndex:
    """Generate hourly observation timestamps up to max timestamp minus prediction window."""
    start_time = transactions["timestamp"].min().floor("h")
    end_time = (
        transactions["timestamp"].max() - pd.Timedelta(hours=PREDICTION_WINDOW_HOURS)
    ).floor("h")

    return pd.date_range(start=start_time, end=end_time, freq="1h")


# 4.4 — ATM x Time Grid
def create_atm_time_grid(atms: pd.DataFrame, observation_times: pd.DatetimeIndex) -> pd.DataFrame:
    """Create Cartesian product grid of ATMs and observation timestamps."""
    grid = pd.MultiIndex.from_product(
        [atms["atm_id"], observation_times],
        names=["atm_id", "observation_time"]
    ).to_frame(index=False)
    return grid


def attach_atm_information(grid: pd.DataFrame, atms: pd.DataFrame) -> pd.DataFrame:
    """Attach static ATM metadata (location, type, bank, district) to grid."""
    atm_columns = [
        "atm_id",
        "bank_id",
        "district_id",
        "latitude",
        "longitude",
        "atm_type",
        "is_active"
    ]
    return grid.merge(atms[atm_columns], on="atm_id", how="left")


# 4.5 — Temporal Features
def create_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract hour, day of week, and weekend indicator."""
    df["hour"] = df["observation_time"].dt.hour
    df["day_of_week"] = df["observation_time"].dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    return df


# 4.6 — Complaint Activity Features
def add_complaint_features(df: pd.DataFrame, complaints: pd.DataFrame) -> pd.DataFrame:
    """Calculate complaint activity in the past 1h, 6h, and 24h leading up to observation time."""
    complaints = complaints.copy()
    complaint_times = complaints[
        ["complaint_id", "timestamp", "latitude", "longitude"]
    ].sort_values("timestamp")

    result = []
    windows = {
        "complaints_last_1h": 1,
        "complaints_last_6h": 6,
        "complaints_last_24h": 24
    }

    for _, row in df.iterrows():
        t = row["observation_time"]
        features = row.to_dict()

        for name, hours in windows.items():
            start = t - pd.Timedelta(hours=hours)
            mask = (complaint_times["timestamp"] > start) & (complaint_times["timestamp"] <= t)
            features[name] = int(mask.sum())

        result.append(features)

    return pd.DataFrame(result)


# 4.7 — Withdrawal Activity Features
def add_withdrawal_features(df: pd.DataFrame, withdrawals: pd.DataFrame) -> pd.DataFrame:
    """Calculate withdrawals at this ATM in the past 1h, 6h, and 24h."""
    withdrawals = withdrawals.sort_values("timestamp")

    result = []
    for _, row in df.iterrows():
        t = row["observation_time"]
        features = row.to_dict()

        for hours in [1, 6, 24]:
            start = t - pd.Timedelta(hours=hours)
            mask = (
                (withdrawals["timestamp"] > start)
                & (withdrawals["timestamp"] <= t)
                & (withdrawals["atm_id"] == row["atm_id"])
            )
            features[f"withdrawals_last_{hours}h"] = int(mask.sum())

        result.append(features)

    return pd.DataFrame(result)


# 4.8 — Financial Activity Features
def add_financial_features(df: pd.DataFrame, withdrawals: pd.DataFrame) -> pd.DataFrame:
    """Calculate financial metrics over the past 6 hours for this ATM."""
    withdrawals = withdrawals.copy()

    result = []
    for _, row in df.iterrows():
        t = row["observation_time"]
        start = t - pd.Timedelta(hours=6)

        mask = (
            (withdrawals["timestamp"] > start)
            & (withdrawals["timestamp"] <= t)
            & (withdrawals["atm_id"] == row["atm_id"])
        )
        recent = withdrawals.loc[mask]

        features = row.to_dict()
        features["withdrawal_count"] = len(recent)
        features["total_withdrawal_amount"] = float(recent["amount"].sum())
        features["average_withdrawal"] = (
            float(recent["amount"].mean()) if len(recent) > 0 else 0.0
        )
        features["unique_accounts"] = int(recent["account_id"].nunique())
        features["transaction_velocity"] = float(len(recent) / 6.0)

        result.append(features)

    return pd.DataFrame(result)


# 4.9 — Haversine Distance
def haversine_distance(
    lat1: Any, lon1: Any, lat2: Any, lon2: Any
) -> np.ndarray:
    """Calculate great circle distance between two points or sets of points on Earth in km."""
    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)
    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        np.sin(dlat / 2.0) ** 2
        + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
    )

    return 2.0 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))


# 4.10 — Spatial Complaint Features
def add_spatial_complaint_features(df: pd.DataFrame, complaints: pd.DataFrame) -> pd.DataFrame:
    """Count complaints within 1km and 3km occurring on or before observation time."""
    complaints = complaints.copy()

    result = []
    for _, row in df.iterrows():
        t = row["observation_time"]
        historical = complaints[complaints["timestamp"] <= t]

        features = row.to_dict()
        if historical.empty:
            features["complaints_1km"] = 0
            features["complaints_3km"] = 0
            result.append(features)
            continue

        distances = haversine_distance(
            row["latitude"],
            row["longitude"],
            historical["latitude"].values,
            historical["longitude"].values
        )

        features["complaints_1km"] = int((distances <= 1.0).sum())
        features["complaints_3km"] = int((distances <= 3.0).sum())
        result.append(features)

    return pd.DataFrame(result)


# 4.11 — Spatial Fraud Features
def add_spatial_fraud_features(df: pd.DataFrame, fraud_transactions: pd.DataFrame) -> pd.DataFrame:
    """Count fraud events within 1km and 3km occurring on or before observation time."""
    fraud_transactions = fraud_transactions.copy()

    result = []
    for _, row in df.iterrows():
        t = row["observation_time"]
        historical = fraud_transactions[fraud_transactions["timestamp"] <= t]

        features = row.to_dict()
        if historical.empty:
            features["fraud_events_1km"] = 0
            features["fraud_events_3km"] = 0
            result.append(features)
            continue

        distances = haversine_distance(
            row["latitude"],
            row["longitude"],
            historical["latitude"].values,
            historical["longitude"].values
        )

        features["fraud_events_1km"] = int((distances <= 1.0).sum())
        features["fraud_events_3km"] = int((distances <= 3.0).sum())
        result.append(features)

    return pd.DataFrame(result)


# 4.12 — Distance from Recent Fraud
def add_distance_from_recent_fraud(df: pd.DataFrame, fraud_transactions: pd.DataFrame) -> pd.DataFrame:
    """Compute distance in km to the most recent fraud event occurring on or before observation time."""
    fraud_transactions = fraud_transactions.sort_values("timestamp")

    result = []
    for _, row in df.iterrows():
        t = row["observation_time"]
        historical = fraud_transactions[fraud_transactions["timestamp"] <= t]

        features = row.to_dict()
        if historical.empty:
            features["distance_from_recent_fraud"] = -1.0
            result.append(features)
            continue

        recent = historical.iloc[-1]
        distance = haversine_distance(
            row["latitude"],
            row["longitude"],
            recent["latitude"],
            recent["longitude"]
        )

        features["distance_from_recent_fraud"] = float(distance)
        result.append(features)

    return pd.DataFrame(result)


# 4.13 — Historical Hotspot Score
def add_historical_hotspot_score(df: pd.DataFrame, fraud_transactions: pd.DataFrame) -> pd.DataFrame:
    """Calculate prototype historical hotspot score (0-100) per ATM."""
    fraud_counts = (
        fraud_transactions.groupby("atm_id")
        .size()
        .rename("historical_fraud_count")
        .reset_index()
    )

    df = df.merge(fraud_counts, on="atm_id", how="left")
    df["historical_fraud_count"] = df["historical_fraud_count"].fillna(0)

    max_count = df["historical_fraud_count"].max()
    if max_count > 0:
        df["historical_hotspot_score"] = (
            df["historical_fraud_count"] / max_count * 100.0
        )
    else:
        df["historical_hotspot_score"] = 0.0

    return df


# Utilities and Pipeline
def get_feature_groups() -> Dict[str, List[str]]:
    """Retrieve mapping of all feature group categories and member column names."""
    return FEATURE_GROUPS


def validate_feature_matrix(df: pd.DataFrame, strict: bool = False) -> Tuple[bool, List[str]]:
    """Verify presence of required features in a dataframe."""
    missing = [feat for feat in ALL_MODEL_FEATURES if feat not in df.columns]
    is_valid = len(missing) == 0
    if strict and not is_valid:
        raise ValueError(f"Feature dataframe missing {len(missing)} required features: {missing}")
    return is_valid, missing


def build_feature_pipeline(
    numerical_cols: Optional[List[str]] = None,
    categorical_cols: Optional[List[str]] = None
) -> ColumnTransformer:
    """Construct standard feature transformation pipeline for model ingestion."""
    if numerical_cols is None:
        numerical_cols = ALL_MODEL_FEATURES
    if categorical_cols is None:
        categorical_cols = []

    transformers = [
        ("num", Pipeline(steps=[("scaler", StandardScaler())]), numerical_cols)
    ]
    if categorical_cols:
        transformers.append(
            (
                "cat",
                Pipeline(steps=[("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]),
                categorical_cols
            )
        )

    return ColumnTransformer(transformers=transformers, remainder="drop")
