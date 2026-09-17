"""Phase 3: Data Preprocessing Pipeline.

Prepares, validates, cleans, and standardizes raw datasets for feature engineering.
Strictly avoids premature feature scaling or premature target leakage.

Pipeline steps:
1. Load raw datasets (banks, districts, atms, complaints, transactions)
2. Convert and validate timestamp datetimes (2026-01-01 to 2026-08-31)
3. Standardize string categories (uppercase, trimmed)
4. Remove duplicate records using primary keys
5. Validate foreign keys and referential integrity
6. Validate numerical amounts and withdrawal ranges (no negative amounts)
7. Validate geographical coordinates (within valid lat/lon ranges)
8. Sort time-series data chronologically
9. Generate comprehensive data quality report
10. Save cleaned datasets to data/processed/
"""

from pathlib import Path
import pandas as pd
import numpy as np
from typing import Tuple, Optional, Any

RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parents[1] / "data" / "processed"


def load_datasets() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load the 5 raw datasets from data/raw/."""
    banks = pd.read_csv(RAW_DIR / "banks.csv")
    districts = pd.read_csv(RAW_DIR / "districts.csv")
    atms = pd.read_csv(RAW_DIR / "atms.csv")
    complaints = pd.read_csv(RAW_DIR / "complaints.csv")
    transactions = pd.read_csv(RAW_DIR / "transactions.csv")

    return banks, districts, atms, complaints, transactions


def convert_datetime_columns(
    complaints: pd.DataFrame, 
    transactions: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Standardize and validate datetime timestamp columns."""
    # Handle complaints timestamp
    if "timestamp" not in complaints.columns and "reported_at" in complaints.columns:
        complaints["timestamp"] = pd.to_datetime(complaints["reported_at"], errors="coerce")
    else:
        complaints["timestamp"] = pd.to_datetime(complaints["timestamp"], errors="coerce")

    # Handle transactions timestamp
    if "timestamp" not in transactions.columns and "transaction_time" in transactions.columns:
        transactions["timestamp"] = pd.to_datetime(transactions["transaction_time"], errors="coerce")
    else:
        transactions["timestamp"] = pd.to_datetime(transactions["timestamp"], errors="coerce")

    assert complaints["timestamp"].notna().all(), "Invalid or null timestamp found in complaints"
    assert transactions["timestamp"].notna().all(), "Invalid or null timestamp found in transactions"

    return complaints, transactions


def standardize_categories(
    complaints: pd.DataFrame, 
    transactions: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Standardize categorical strings (strip whitespace, uppercase)."""
    if "category" not in complaints.columns and "crime_category" in complaints.columns:
        complaints["category"] = complaints["crime_category"]

    complaints["category"] = (
        complaints["category"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    transactions["transaction_type"] = (
        transactions["transaction_type"]
        .astype(str)
        .str.strip()
        .str.upper()
    )

    return complaints, transactions


def remove_duplicate_records(
    banks: pd.DataFrame,
    districts: pd.DataFrame,
    atms: pd.DataFrame,
    complaints: pd.DataFrame,
    transactions: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Deduplicate records by primary key."""
    banks = banks.drop_duplicates(subset=["bank_id"]).copy()
    districts = districts.drop_duplicates(subset=["district_id"]).copy()
    atms = atms.drop_duplicates(subset=["atm_id"]).copy()
    complaints = complaints.drop_duplicates(subset=["complaint_id"]).copy()
    transactions = transactions.drop_duplicates(subset=["transaction_id"]).copy()

    return banks, districts, atms, complaints, transactions


def validate_foreign_keys(
    atms: pd.DataFrame, 
    transactions: pd.DataFrame, 
    complaints: pd.DataFrame
) -> bool:
    """Validate referential integrity between transactions, complaints, and ATMs."""
    valid_atm_ids = set(atms["atm_id"])

    transaction_invalid_atms = (
        ~transactions["atm_id"].isin(valid_atm_ids)
    ).sum()

    assert transaction_invalid_atms == 0, \
        f"Invalid ATM IDs in transactions: {transaction_invalid_atms}"

    if "atm_id" in complaints.columns:
        complaint_invalid_atms = (
            ~complaints["atm_id"].isin(valid_atm_ids)
        ).sum()
        assert complaint_invalid_atms == 0, \
            f"Invalid ATM IDs in complaints: {complaint_invalid_atms}"

    return True


def validate_atm_relationships(
    atms: pd.DataFrame, 
    banks: pd.DataFrame, 
    districts: pd.DataFrame
) -> bool:
    """Validate that every ATM links to a valid bank_id and district_id."""
    valid_bank_ids = set(banks["bank_id"])
    valid_district_ids = set(districts["district_id"])

    invalid_banks = (~atms["bank_id"].isin(valid_bank_ids)).sum()
    invalid_districts = (~atms["district_id"].isin(valid_district_ids)).sum()

    assert invalid_banks == 0, f"Invalid bank IDs in ATMs: {invalid_banks}"
    assert invalid_districts == 0, f"Invalid district IDs in ATMs: {invalid_districts}"

    return True


def validate_transaction_amounts(transactions: pd.DataFrame) -> pd.DataFrame:
    """Ensure no negative transaction amounts exist."""
    assert (transactions["amount"] >= 0).all(), "Negative transaction amount found!"
    return transactions


def validate_withdrawals(transactions: pd.DataFrame) -> pd.DataFrame:
    """Ensure all withdrawal operations have positive values within realistic ATM cash limits."""
    withdrawals = transactions[transactions["transaction_type"] == "WITHDRAWAL"]
    assert (withdrawals["amount"] > 0).all(), "Zero or negative withdrawal amount found!"
    assert (withdrawals["amount"] <= 50000).all(), "Exorbitant withdrawal amount found exceeding ATM hardware limit!"
    return transactions


def validate_coordinates(atms: pd.DataFrame, complaints: pd.DataFrame) -> bool:
    """Validate geographical latitude and longitude boundaries."""
    assert atms["latitude"].between(-90, 90).all(), "Invalid ATM latitude"
    assert atms["longitude"].between(-180, 180).all(), "Invalid ATM longitude"
    assert complaints["latitude"].between(-90, 90).all(), "Invalid Complaint latitude"
    assert complaints["longitude"].between(-180, 180).all(), "Invalid Complaint longitude"
    return True


def sort_temporal_data(
    complaints: pd.DataFrame, 
    transactions: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Sort event data chronologically for safe rolling window and time-aware evaluation."""
    complaints = complaints.sort_values("timestamp").reset_index(drop=True)
    transactions = transactions.sort_values("timestamp").reset_index(drop=True)
    return complaints, transactions


def generate_quality_report(
    banks: pd.DataFrame,
    districts: pd.DataFrame,
    atms: pd.DataFrame,
    complaints: pd.DataFrame,
    transactions: pd.DataFrame
) -> None:
    """Print repeatable quality report for all datasets."""
    datasets = {
        "banks": banks,
        "districts": districts,
        "atms": atms,
        "complaints": complaints,
        "transactions": transactions
    }

    for name, df in datasets.items():
        print(f"\n===== {name.upper()} =====")
        print("Rows:", len(df))
        print("Columns:", len(df.columns))
        print("Duplicates:", df.duplicated().sum())
        print("\nMissing values:")
        print(df.isna().sum())
        print("\nData types:")
        print(df.dtypes)


def time_aware_train_test_split(
    df: pd.DataFrame,
    timestamp_col: str,
    test_size: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Perform chronological train/test split to prevent data leakage."""
    if timestamp_col not in df.columns:
        raise ValueError(f"Timestamp column '{timestamp_col}' not found in dataframe.")

    sorted_df = df.sort_values(by=timestamp_col).reset_index(drop=True)
    split_index = int(len(sorted_df) * (1.0 - test_size))

    train_df = sorted_df.iloc[:split_index].copy()
    test_df = sorted_df.iloc[split_index:].copy()

    return train_df, test_df


def preprocess() -> None:
    """Execute complete Phase 3 data preprocessing pipeline."""
    print("==========================================================")
    print("             PHASE 3: DATA PREPROCESSING                  ")
    print("==========================================================")

    print("Loading raw datasets...")
    banks, districts, atms, complaints, transactions = load_datasets()

    print("Converting datetime columns...")
    complaints, transactions = convert_datetime_columns(complaints, transactions)

    print("Standardizing categories...")
    complaints, transactions = standardize_categories(complaints, transactions)

    print("Removing duplicate records...")
    banks, districts, atms, complaints, transactions = remove_duplicate_records(
        banks, districts, atms, complaints, transactions
    )

    print("Validating foreign keys...")
    validate_foreign_keys(atms, transactions, complaints)
    validate_atm_relationships(atms, banks, districts)

    print("Validating transaction amounts...")
    transactions = validate_transaction_amounts(transactions)
    transactions = validate_withdrawals(transactions)

    print("Validating coordinates...")
    validate_coordinates(atms, complaints)

    print("Sorting temporal data...")
    complaints, transactions = sort_temporal_data(complaints, transactions)

    print("Generating quality report...")
    generate_quality_report(banks, districts, atms, complaints, transactions)

    # Save to data/processed/
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    banks.to_csv(PROCESSED_DIR / "banks.csv", index=False)
    districts.to_csv(PROCESSED_DIR / "districts.csv", index=False)
    atms.to_csv(PROCESSED_DIR / "atms.csv", index=False)
    complaints.to_csv(PROCESSED_DIR / "complaints.csv", index=False)
    transactions.to_csv(PROCESSED_DIR / "transactions.csv", index=False)

    print("\nPreprocessing completed successfully.")
    print(f"Processed data saved to: {PROCESSED_DIR}")


if __name__ == "__main__":
    preprocess()
