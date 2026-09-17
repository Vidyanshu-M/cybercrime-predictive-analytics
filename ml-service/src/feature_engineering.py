import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Optional, Any
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline

# ==============================================================================
# ML Strategy: Three Core Feature Groups
# Specified in the ML strategy section of the system blueprint
# ==============================================================================

# 1. Temporal Features: Time-based cyclic patterns and short/medium/daily rolling windows
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

# 2. Spatial Features: Geographic proximity, regional clustering, and hotspot intensity
SPATIAL_FEATURES: List[str] = [
    "fraud_events_1km",
    "fraud_events_3km",
    "complaints_1km",
    "complaints_3km",
    "distance_from_recent_fraud",
    "historical_hotspot_score"
]

# 3. Financial / Activity Features: Volume, value anomalies, account entropy, and pace
FINANCIAL_ACTIVITY_FEATURES: List[str] = [
    "withdrawal_count",
    "total_withdrawal_amount",
    "average_withdrawal",
    "unique_accounts",
    "transaction_velocity"
]

# Consolidated Catalog
FEATURE_GROUPS: Dict[str, List[str]] = {
    "temporal": TEMPORAL_FEATURES,
    "spatial": SPATIAL_FEATURES,
    "financial_activity": FINANCIAL_ACTIVITY_FEATURES
}

ALL_MODEL_FEATURES: List[str] = (
    TEMPORAL_FEATURES + SPATIAL_FEATURES + FINANCIAL_ACTIVITY_FEATURES
)


def get_feature_groups() -> Dict[str, List[str]]:
    """Retrieve mapping of all feature group categories and their member column names.

    Returns:
        Dict[str, List[str]]: Dictionary with temporal, spatial, and financial_activity lists.
    """
    return FEATURE_GROUPS


def validate_feature_matrix(df: pd.DataFrame, strict: bool = False) -> Tuple[bool, List[str]]:
    """Verify presence of required features in a dataframe.

    Args:
        df (pd.DataFrame): Dataframe to validate.
        strict (bool): If True, checks for all features; if False, returns missing list.

    Returns:
        Tuple[bool, List[str]]: Boolean indicating validity and list of missing feature names.
    """
    missing = [feat for feat in ALL_MODEL_FEATURES if feat not in df.columns]
    is_valid = len(missing) == 0
    if strict and not is_valid:
        raise ValueError(f"Feature dataframe missing {len(missing)} required features: {missing}")
    return is_valid, missing


def extract_temporal_features(df: pd.DataFrame, timestamp_col: str = "timestamp") -> pd.DataFrame:
    """Derive base temporal features from a datetime column.

    Args:
        df (pd.DataFrame): Input dataframe.
        timestamp_col (str): Datetime column name.

    Returns:
        pd.DataFrame: Dataframe with hour, day_of_week, and is_weekend populated.
    """
    df_out = df.copy()
    if timestamp_col in df_out.columns:
        dt = pd.to_datetime(df_out[timestamp_col], errors="coerce")
        df_out["hour"] = dt.dt.hour
        df_out["day_of_week"] = dt.dt.dayofweek
        df_out["is_weekend"] = df_out["day_of_week"].isin([5, 6]).astype(int)
    return df_out


def build_feature_pipeline(
    numerical_cols: Optional[List[str]] = None,
    categorical_cols: Optional[List[str]] = None
) -> ColumnTransformer:
    """Construct standard feature transformation pipeline for model ingestion.

    Args:
        numerical_cols (Optional[List[str]]): Numerical feature columns (defaults to ALL_MODEL_FEATURES).
        categorical_cols (Optional[List[str]]): Categorical feature columns.

    Returns:
        ColumnTransformer: Preprocessing transformer pipeline.
    """
    if numerical_cols is None:
        numerical_cols = ALL_MODEL_FEATURES
    if categorical_cols is None:
        categorical_cols = []

    transformers = [
        ("num", Pipeline(steps=[("scaler", StandardScaler())]), numerical_cols)
    ]
    if categorical_cols:
        transformers.append(
            ("cat", Pipeline(steps=[("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))]), categorical_cols)
        )

    return ColumnTransformer(transformers=transformers, remainder="drop")
