import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, Literal, Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline

from src.evaluation import evaluate_predictions

# ==============================================================================
# Model Progression Hierarchy
# 1. Logistic Regression: Baseline
# 2. Random Forest: Comparison
# 3. XGBoost: Primary Production Model
# ==============================================================================

ModelType = Literal["logistic_regression", "random_forest", "xgboost"]


def get_model_estimator(
    model_type: ModelType, 
    custom_params: Optional[Dict[str, Any]] = None
) -> Any:
    """Instantiate classifier based on model progression tier.

    Args:
        model_type (ModelType): "logistic_regression", "random_forest", or "xgboost".
        custom_params (Optional[Dict[str, Any]]): Hyperparameter overrides.

    Returns:
        Classifier instance.
    """
    params = custom_params or {}

    if model_type == "logistic_regression":
        # Baseline model: fast, linear, highly interpretable
        default_params = {"max_iter": 1000, "random_state": 42, "class_weight": "balanced"}
        default_params.update(params)
        return LogisticRegression(**default_params)

    elif model_type == "random_forest":
        # Comparison model: ensemble bagging, non-linear baseline
        default_params = {
            "n_estimators": 100, 
            "max_depth": 10, 
            "random_state": 42, 
            "class_weight": "balanced"
        }
        default_params.update(params)
        return RandomForestClassifier(**default_params)

    elif model_type == "xgboost":
        # Primary model: gradient boosting, optimized for high precision and recall
        default_params = {
            "n_estimators": 150, 
            "max_depth": 6, 
            "learning_rate": 0.05, 
            "eval_metric": "logloss",
            "random_state": 42
        }
        default_params.update(params)
        return XGBClassifier(**default_params)

    else:
        raise ValueError(f"Unsupported model type: {model_type}. Choose from 'logistic_regression', 'random_forest', or 'xgboost'.")


def train_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    model_type: ModelType = "xgboost",
    preprocessor: Optional[Any] = None,
    model_params: Optional[Dict[str, Any]] = None
) -> Pipeline:
    """Train model pipeline for cybercrime prediction following the progression strategy.

    Args:
        X_train (pd.DataFrame): Training features.
        y_train (pd.Series): Training target.
        model_type (ModelType): Progression level ('logistic_regression', 'random_forest', 'xgboost').
        preprocessor (Optional[Any]): Scikit-learn feature preprocessor.
        model_params (Optional[Dict[str, Any]]): Model hyperparameter overrides.

    Returns:
        Pipeline: Fitted model pipeline.
    """
    classifier = get_model_estimator(model_type, model_params)

    if preprocessor is not None:
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier)
        ])
    else:
        pipeline = Pipeline(steps=[
            ("classifier", classifier)
        ])

    pipeline.fit(X_train, y_train)
    return pipeline


def evaluate_model_pipeline(
    pipeline: Pipeline, 
    X_test: pd.DataFrame, 
    y_test: pd.Series
) -> Dict[str, Any]:
    """Generate evaluation metrics on test dataset for a fitted pipeline."""
    y_pred = pipeline.predict(X_test)
    y_proba = None
    if hasattr(pipeline, "predict_proba"):
        try:
            y_proba = pipeline.predict_proba(X_test)
        except Exception:
            pass
    return evaluate_predictions(y_test.values, y_pred, y_proba)


def compare_progression_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    preprocessor: Optional[Any] = None
) -> Tuple[Dict[str, Pipeline], pd.DataFrame]:
    """Train and evaluate the full progression hierarchy side-by-side:
    1. Logistic Regression (Baseline)
    2. Random Forest (Comparison)
    3. XGBoost (Primary)

    Returns:
        Tuple[Dict[str, Pipeline], pd.DataFrame]: Trained pipelines and comparison summary table.
    """
    models = ["logistic_regression", "random_forest", "xgboost"]
    trained_pipelines: Dict[str, Pipeline] = {}
    summary_records = []

    for model_name in models:
        print(f"Training {model_name}...")
        pipe = train_model(X_train, y_train, model_type=model_name, preprocessor=preprocessor)
        metrics = evaluate_model_pipeline(pipe, X_test, y_test)
        trained_pipelines[model_name] = pipe

        summary_records.append({
            "model": model_name,
            "role": "baseline" if model_name == "logistic_regression" else ("comparison" if model_name == "random_forest" else "primary"),
            "accuracy": metrics.get("accuracy", 0.0),
            "precision": metrics.get("precision_macro", 0.0),
            "recall": metrics.get("recall_macro", 0.0),
            "f1_score": metrics.get("f1_macro", 0.0),
            "roc_auc": metrics.get("roc_auc")
        })

    summary_df = pd.DataFrame(summary_records).sort_values(by="f1_score", ascending=False).reset_index(drop=True)
    return trained_pipelines, summary_df


def save_model(model: Any, filepath: str) -> None:
    """Persist trained model artifact to disk.

    Args:
        model (Any): Trained model object or pipeline.
        filepath (str): Output destination path.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    joblib.dump(model, filepath)
    print(f"Model saved successfully to: {filepath}")
