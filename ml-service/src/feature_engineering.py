import pandas as pd
from typing import Tuple, List, Optional
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline


def build_feature_pipeline(
    numerical_cols: List[str], 
    categorical_cols: List[str]
) -> ColumnTransformer:
    """Build a scikit-learn feature transformation pipeline.

    Args:
        numerical_cols (List[str]): List of continuous/numeric column names.
        categorical_cols (List[str]): List of categorical column names.

    Returns:
        ColumnTransformer: Preprocessing transformer pipeline.
    """
    numeric_transformer = Pipeline(steps=[
        ("scaler", StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numerical_cols),
            ("cat", categorical_transformer, categorical_cols)
        ],
        remainder="drop"
    )
    return preprocessor


def extract_temporal_features(df: pd.DataFrame, datetime_col: str = "timestamp") -> pd.DataFrame:
    """Extract temporal features (hour, day of week, month) from timestamp.

    Args:
        df (pd.DataFrame): Input dataframe.
        datetime_col (str): Name of datetime column.

    Returns:
        pd.DataFrame: Dataframe augmented with temporal features.
    """
    df_feat = df.copy()
    if datetime_col in df_feat.columns:
        dt_series = pd.to_datetime(df_feat[datetime_col], errors="coerce")
        df_feat["incident_hour"] = dt_series.dt.hour
        df_feat["incident_dayofweek"] = dt_series.dt.dayofweek
        df_feat["incident_month"] = dt_series.dt.month
        df_feat["is_weekend"] = df_feat["incident_dayofweek"].isin([5, 6]).astype(int)
    return df_feat
