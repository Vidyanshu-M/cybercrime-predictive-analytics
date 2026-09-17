import pandas as pd
import numpy as np
from typing import Tuple, Optional


def load_dataset(file_path: str) -> pd.DataFrame:
    """Load raw dataset from given file path.

    Args:
        file_path (str): Path to CSV or tabular file.

    Returns:
        pd.DataFrame: Loaded dataset.
    """
    return pd.read_csv(file_path)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean the raw cybercrime incident dataset.
    - Removes duplicates
    - Standardizes column names
    - Handles missing or invalid values

    Args:
        df (pd.DataFrame): Raw dataframe.

    Returns:
        pd.DataFrame: Cleaned dataframe.
    """
    df_cleaned = df.copy()
    df_cleaned.columns = [col.strip().lower().replace(" ", "_") for col in df_cleaned.columns]
    df_cleaned = df_cleaned.drop_duplicates()
    return df_cleaned


def preprocess_data(
    df: pd.DataFrame, 
    target_column: Optional[str] = None
) -> Tuple[pd.DataFrame, Optional[pd.Series]]:
    """Preprocess data into features and target.

    Args:
        df (pd.DataFrame): Cleaned input data.
        target_column (Optional[str]): Target label column name if present.

    Returns:
        Tuple[pd.DataFrame, Optional[pd.Series]]: Features X and Target y.
    """
    cleaned = clean_data(df)
    if target_column and target_column in cleaned.columns:
        X = cleaned.drop(columns=[target_column])
        y = cleaned[target_column]
        return X, y
    return cleaned, None
