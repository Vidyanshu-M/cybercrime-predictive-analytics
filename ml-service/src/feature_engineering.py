"""Phase 4: Feature Engineering Pipeline.

Converts cleaned transaction-anchored event data from Phase 3 into an
ATM x Observation Time ML feature matrix for 3-hour elevated fraud prediction.

Strictly enforces the Zero-Leakage Boundary:
- Observation Time T = arrival time of an ATM transaction.
- Input Features = functions strictly of events with timestamp <= T.
- Prediction Horizon = (T, T + 3h] used exclusively to compute the target.
- Target = 1 if future fraud-related withdrawals in (T, T + 3h] >= 2, else 0.
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
    "complaints_1km",
    "complaints_3km",
    "fraud_events_1km",
    "fraud_events_3km",
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

FORBIDDEN_FEATURES: List[str] = [
    "risk_label",
    "complaint_id",
    "transaction_id",
    "transaction_reference",
    "future_fraud_withdrawals_3h"
]


# 4.2 — Load Processed Data
def load_processed_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load cleaned datasets from data/processed/."""
    atms = pd.read_csv(PROCESSED_DIR / "atms.csv")
    complaints = pd.read_csv(PROCESSED_DIR / "complaints.csv")
    transactions = pd.read_csv(PROCESSED_DIR / "transactions.csv")

    complaints["timestamp"] = pd.to_datetime(complaints["timestamp"])
    transactions["timestamp"] = pd.to_datetime(transactions["timestamp"])

    return atms, complaints, transactions


# 4.18.1 — Create Observations & Attach ATM Metadata
def create_transaction_observations(transactions: pd.DataFrame) -> pd.DataFrame:
    """Create observation points anchored on transaction timestamps per ATM."""
    observations = (
        transactions[["atm_id", "timestamp"]]
        .drop_duplicates()
        .rename(columns={"timestamp": "observation_time"})
        .sort_values(["atm_id", "observation_time"])
        .reset_index(drop=True)
    )
    return observations


def attach_atm_information(observations: pd.DataFrame, atms: pd.DataFrame) -> pd.DataFrame:
    """Attach static ATM metadata (location, type, bank, district) to observations."""
    columns = [
        "atm_id",
        "bank_id",
        "district_id",
        "latitude",
        "longitude",
        "atm_type",
        "is_active"
    ]
    return observations.merge(atms[columns], on="atm_id", how="left")


# 4.18.2 — Temporal Features
def add_temporal_features(df: pd.DataFrame) -> pd.DataFrame:
    """Extract hour, day of week, and weekend indicator from observation time."""
    df["hour"] = df["observation_time"].dt.hour
    df["day_of_week"] = df["observation_time"].dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    return df


# 4.18.3 — Complaint Features (Windows: 1h, 6h, 24h)
def add_complaint_features(df: pd.DataFrame, complaints: pd.DataFrame) -> pd.DataFrame:
    """Calculate system-wide complaint activity in past 1h, 6h, and 24h prior to observation time."""
    comp_ts = complaints["timestamp"].sort_values().values
    obs_ts = df["observation_time"].values

    for hours in [1, 6, 24]:
        start_ts = (df["observation_time"] - pd.Timedelta(hours=hours)).values
        high_idx = np.searchsorted(comp_ts, obs_ts, side="right")
        low_idx = np.searchsorted(comp_ts, start_ts, side="right")
        df[f"complaints_last_{hours}h"] = (high_idx - low_idx).astype(int)

    return df


# 4.18.4 — Withdrawal Window Features (Windows: 1h, 6h, 24h per ATM)
def add_withdrawal_window_features(df: pd.DataFrame, withdrawals: pd.DataFrame) -> pd.DataFrame:
    """Calculate withdrawals at this ATM in past 1h, 6h, and 24h."""
    atm_withdrawals = {k: v["timestamp"].sort_values().values for k, v in withdrawals.groupby("atm_id")}

    w1, w6, w24 = [], [], []
    for _, row in df.iterrows():
        t = row["observation_time"]
        ts = atm_withdrawals.get(row["atm_id"])
        if ts is not None and len(ts) > 0:
            h1 = np.searchsorted(ts, t - pd.Timedelta(hours=1), side="right")
            h6 = np.searchsorted(ts, t - pd.Timedelta(hours=6), side="right")
            h24 = np.searchsorted(ts, t - pd.Timedelta(hours=24), side="right")
            cur = np.searchsorted(ts, t, side="right")
            w1.append(cur - h1)
            w6.append(cur - h6)
            w24.append(cur - h24)
        else:
            w1.append(0)
            w6.append(0)
            w24.append(0)

    df["withdrawals_last_1h"] = w1
    df["withdrawals_last_6h"] = w6
    df["withdrawals_last_24h"] = w24
    return df


# 4.18.5 — Financial / Activity Features (6-hour historical window)
def add_financial_features(df: pd.DataFrame, withdrawals: pd.DataFrame) -> pd.DataFrame:
    """Calculate financial metrics over the past 6 hours for this ATM."""
    atm_withdrawals = {k: v.sort_values("timestamp") for k, v in withdrawals.groupby("atm_id")}

    w_cnt, w_tot, w_avg, w_uniq, w_vel = [], [], [], [], []
    for _, row in df.iterrows():
        t = row["observation_time"]
        w_atm = atm_withdrawals.get(row["atm_id"])
        if w_atm is not None:
            ts = w_atm["timestamp"].values
            low_idx = np.searchsorted(ts, t - pd.Timedelta(hours=6), side="right")
            high_idx = np.searchsorted(ts, t, side="right")
            recent = w_atm.iloc[low_idx:high_idx]
            count = len(recent)
            w_cnt.append(count)
            if count > 0:
                w_tot.append(float(recent["amount"].sum()))
                w_avg.append(float(recent["amount"].mean()))
                w_uniq.append(int(recent["account_id"].nunique()))
            else:
                w_tot.append(0.0)
                w_avg.append(0.0)
                w_uniq.append(0)
            w_vel.append(float(count / 6.0))
        else:
            w_cnt.append(0)
            w_tot.append(0.0)
            w_avg.append(0.0)
            w_uniq.append(0)
            w_vel.append(0.0)

    df["withdrawal_count"] = w_cnt
    df["total_withdrawal_amount"] = w_tot
    df["average_withdrawal"] = w_avg
    df["unique_accounts"] = w_uniq
    df["transaction_velocity"] = w_vel
    return df


# Haversine Distance (vectorized)
def haversine_distance(
    lat1: Any, lon1: Any, lat2: Any, lon2: Any
) -> np.ndarray:
    """Calculate great circle distance between two coordinates or sets of coordinates in km."""
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = (
        np.sin(dlat / 2.0) ** 2
        + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
    )
    return 2.0 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))


# 4.18.6 — Spatial Complaint Features (1km and 3km)
def add_spatial_complaint_features(df: pd.DataFrame, complaints: pd.DataFrame) -> pd.DataFrame:
    """Count complaints within 1km and 3km occurring on or before observation time."""
    comp_lat = complaints["latitude"].values
    comp_lon = complaints["longitude"].values
    comp_times = complaints["timestamp"].values

    c1km, c3km = [], []
    for _, row in df.iterrows():
        t = row["observation_time"]
        mask = comp_times <= t
        if not mask.any():
            c1km.append(0)
            c3km.append(0)
        else:
            d = haversine_distance(row["latitude"], row["longitude"], comp_lat[mask], comp_lon[mask])
            c1km.append(int((d <= 1.0).sum()))
            c3km.append(int((d <= 3.0).sum()))

    df["complaints_1km"] = c1km
    df["complaints_3km"] = c3km
    return df


# 4.18.7 — Spatial Fraud Features (1km and 3km)
def add_spatial_fraud_features(df: pd.DataFrame, fraud_withdrawals: pd.DataFrame) -> pd.DataFrame:
    """Count fraud events within 1km and 3km occurring on or before observation time."""
    fw_lat = fraud_withdrawals["latitude"].values
    fw_lon = fraud_withdrawals["longitude"].values
    fw_times = fraud_withdrawals["timestamp"].values

    f1km, f3km = [], []
    for _, row in df.iterrows():
        t = row["observation_time"]
        mask = fw_times <= t
        if not mask.any():
            f1km.append(0)
            f3km.append(0)
        else:
            d = haversine_distance(row["latitude"], row["longitude"], fw_lat[mask], fw_lon[mask])
            f1km.append(int((d <= 1.0).sum()))
            f3km.append(int((d <= 3.0).sum()))

    df["fraud_events_1km"] = f1km
    df["fraud_events_3km"] = f3km
    return df


# 4.18.8 — Distance from Recent Fraud
def add_distance_from_recent_fraud(df: pd.DataFrame, fraud_withdrawals: pd.DataFrame) -> pd.DataFrame:
    """Compute distance in km to the most recent fraud event occurring on or before observation time."""
    fw_lat = fraud_withdrawals["latitude"].values
    fw_lon = fraud_withdrawals["longitude"].values
    fw_times = fraud_withdrawals["timestamp"].values

    dist_recent = []
    for _, row in df.iterrows():
        t = row["observation_time"]
        mask = fw_times <= t
        if not mask.any():
            dist_recent.append(-1.0)
        else:
            recent_lat = fw_lat[mask][-1]
            recent_lon = fw_lon[mask][-1]
            d = haversine_distance(row["latitude"], row["longitude"], recent_lat, recent_lon)
            dist_recent.append(float(d))

    df["distance_from_recent_fraud"] = dist_recent
    return df


# 4.18.9 — Historical Hotspot Score (Temporally Safe)
def add_historical_hotspot_score(df: pd.DataFrame, fraud_withdrawals: pd.DataFrame) -> pd.DataFrame:
    """Calculate rolling historical fraud count and normalized hotspot score per ATM (strictly <= T)."""
    atm_fraud = {k: v["timestamp"].sort_values().values for k, v in fraud_withdrawals.groupby("atm_id")}

    hist_counts = []
    for _, row in df.iterrows():
        t = row["observation_time"]
        ts_f = atm_fraud.get(row["atm_id"])
        if ts_f is not None and len(ts_f) > 0:
            hist_counts.append(int(np.searchsorted(ts_f, t, side="right")))
        else:
            hist_counts.append(0)

    df["historical_fraud_count"] = hist_counts
    max_count = df["historical_fraud_count"].max()
    if max_count > 0:
        df["historical_hotspot_score"] = (df["historical_fraud_count"] / max_count * 100.0)
    else:
        df["historical_hotspot_score"] = 0.0

    return df


# 4.18.10 — Future 3-Hour Target
def create_future_target(
    df: pd.DataFrame,
    transactions: pd.DataFrame,
    threshold: int = 2
) -> pd.DataFrame:
    """
    Creates the forecasting target.

    target = 1 if an ATM experiences at least `threshold` fraud-related
             withdrawals during the next 3 hours (T, T + 3h].
    """
    fraud_withdrawals = transactions[
        (transactions["risk_label"] == 1) &
        (transactions["transaction_type"] == "WITHDRAWAL")
    ].sort_values("timestamp")

    atm_fraud = {k: v["timestamp"].values for k, v in fraud_withdrawals.groupby("atm_id")}

    future_cnts = []
    for _, row in df.iterrows():
        atm_id = row["atm_id"]
        t = row["observation_time"]
        future_end = t + pd.Timedelta(hours=3)
        ts_arr = atm_fraud.get(atm_id)
        if ts_arr is not None and len(ts_arr) > 0:
            low = np.searchsorted(ts_arr, t, side="right")
            high = np.searchsorted(ts_arr, future_end, side="right")
            future_cnts.append(int(high - low))
        else:
            future_cnts.append(0)

    df["future_fraud_withdrawals_3h"] = future_cnts
    df["target"] = (df["future_fraud_withdrawals_3h"] >= threshold).astype(int)
    return df


# 4.18.11 — Complete Feature Dataset Builder
def build_feature_dataset() -> pd.DataFrame:
    """Build complete Phase 4 feature matrix adhering strictly to Zero-Leakage rules."""
    print("Loading processed data...")
    atms, complaints, transactions = load_processed_data()

    print("Creating transaction observations...")
    df = create_transaction_observations(transactions)
    print(f"Observations created: {len(df):,}")

    df = attach_atm_information(df, atms)

    print("Creating temporal features...")
    df = add_temporal_features(df)

    withdrawals = transactions[
        transactions["transaction_type"] == "WITHDRAWAL"
    ].copy().sort_values("timestamp")

    fraud_withdrawals = transactions[
        (transactions["risk_label"] == 1) &
        (transactions["transaction_type"] == "WITHDRAWAL")
    ].copy().sort_values("timestamp")

    print("Creating complaint features...")
    df = add_complaint_features(df, complaints)

    print("Creating withdrawal features...")
    df = add_withdrawal_window_features(df, withdrawals)

    print("Creating financial features...")
    df = add_financial_features(df, withdrawals)

    print("Creating spatial complaint features...")
    df = add_spatial_complaint_features(df, complaints)

    print("Creating spatial fraud features...")
    df = add_spatial_fraud_features(df, fraud_withdrawals)

    print("Creating distance feature...")
    df = add_distance_from_recent_fraud(df, fraud_withdrawals)

    print("Creating historical hotspot score...")
    df = add_historical_hotspot_score(df, fraud_withdrawals)

    print("Creating future target (threshold >= 2)...")
    df = create_future_target(df, transactions, threshold=2)

    return df


def audit_leakage(df: pd.DataFrame) -> List[str]:
    """Audit dataset to ensure no forbidden columns are used as model input features."""
    present_forbidden = [col for col in FORBIDDEN_FEATURES if col in df.columns]
    return present_forbidden


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


if __name__ == "__main__":
    df = build_feature_dataset()

    print("\n===== FINAL FEATURES =====")
    print(df.columns.tolist())

    # Leakage Audit
    print("\n===== LEAKAGE CHECK =====")
    present_forbidden = audit_leakage(df)
    print("Forbidden columns present:", present_forbidden)
    model_features_leakage = [col for col in ALL_MODEL_FEATURES if col in FORBIDDEN_FEATURES]
    print("Forbidden model features in ALL_MODEL_FEATURES:", model_features_leakage)

    # Save processed feature dataset
    FEATURE_DIR.mkdir(parents=True, exist_ok=True)
    output_path = FEATURE_DIR / "feature_dataset.csv"
    df.to_csv(output_path, index=False)
    print(f"\nFeature dataset saved to:\n{output_path}")

    # Checkpoint validation prints
    print("\n===== FEATURE DATASET SHAPE =====")
    print(df.shape)

    print("\n===== TARGET DISTRIBUTION =====")
    print(df["target"].value_counts())
    print(df["target"].value_counts(normalize=True) * 100)

    print("\n===== MISSING VALUES =====")
    missing_vals = df.isna().sum().sort_values(ascending=False)
    print(missing_vals[missing_vals > 0] if (missing_vals > 0).any() else "None (0)")

    print("\n===== DUPLICATES =====")
    print(df.duplicated().sum())

    print("\n===== SAMPLE DATA (FIRST 10 ROWS) =====")
    sample_cols = [
        "observation_time",
        "complaints_last_1h",
        "complaints_last_6h",
        "withdrawals_last_1h",
        "withdrawals_last_6h",
        "fraud_events_1km",
        "fraud_events_3km",
        "distance_from_recent_fraud",
        "historical_hotspot_score",
        "target"
    ]
    print(df[sample_cols].head(10))
