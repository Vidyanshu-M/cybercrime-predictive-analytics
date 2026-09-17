import os
import joblib
import pandas as pd
from typing import Dict, Any, Optional
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

from src.preprocessing import clean_data, preprocess_data
from src.feature_engineering import build_feature_pipeline, extract_temporal_features


def train_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    preprocessor: Optional[Any] = None,
    model_params: Optional[Dict[str, Any]] = None
) -> Pipeline:
    """Train predictive model for cybercrime risk / incident classification.

    Args:
        X_train (pd.DataFrame): Training features.
        y_train (pd.Series): Training target.
        preprocessor (Optional[Any]): Scikit-learn transformer for features.
        model_params (Optional[Dict[str, Any]]): Model hyperparameter dictionary.

    Returns:
        Pipeline: Trained full pipeline including preprocessor and classifier.
    """
    params = model_params or {"n_estimators": 100, "random_state": 42}
    classifier = RandomForestClassifier(**params)
    
    if preprocessor is not None:
        model_pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier)
        ])
    else:
        model_pipeline = Pipeline(steps=[
            ("classifier", classifier)
        ])

    model_pipeline.fit(X_train, y_train)
    return model_pipeline


def save_model(model: Any, filepath: str) -> None:
    """Persist trained model artifact to disk.

    Args:
        model (Any): Trained model object or pipeline.
        filepath (str): Output destination path.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)
    print(f"Model saved successfully to: {filepath}")


if __name__ == "__main__":
    print("Execute training pipeline via main.py or run training script directly.")
