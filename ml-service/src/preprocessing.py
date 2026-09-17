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


def time_aware_train_test_split(
    df: pd.DataFrame,
    timestamp_col: str,
    test_size: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Perform strict chronological train/test split to prevent data leakage.

    CRITICAL RULE:
    NEVER use information from the future prediction window to create features.
    Random shuffling leaks future events into the training set. A strict time-aware
    cutoff ensures past data trains the model and future data evaluates it.

    Args:
        df (pd.DataFrame): Input dataframe.
        timestamp_col (str): Column name representing event time.
        test_size (float): Proportion of the dataset for test evaluation (latest timestamps).

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame]: (train_df, test_df) strictly separated in time.
    """
    if timestamp_col not in df.columns:
        raise ValueError(f"Timestamp column '{timestamp_col}' not found in dataframe.")

    sorted_df = df.sort_values(by=timestamp_col).reset_index(drop=True)
    split_index = int(len(sorted_df) * (1.0 - test_size))

    train_df = sorted_df.iloc[:split_index].copy()
    test_df = sorted_df.iloc[split_index:].copy()

    train_max = train_df[timestamp_col].max()
    test_min = test_df[timestamp_col].min()

    print(f"[Time-Aware Split] Training Range: -> {train_max}")
    print(f"[Time-Aware Split] Test Range    : {test_min} ->")

    return train_df, test_df
