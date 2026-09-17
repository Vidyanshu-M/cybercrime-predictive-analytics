import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Union


class ModelPredictor:
    """Class wrapper for loading trained models and generating predictions."""

    def __init__(self, model_path: str):
        """Initialize predictor by loading trained model from path.

        Args:
            model_path (str): Filepath to saved joblib/pickle model artifact.
        """
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at: {model_path}")
        self.model = joblib.load(model_path)

    def predict(self, input_data: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]]) -> np.ndarray:
        """Generate class predictions for given input.

        Args:
            input_data (Union[pd.DataFrame, Dict, List[Dict]]): Input feature data.

        Returns:
            np.ndarray: Predicted class labels.
        """
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        elif isinstance(input_data, list):
            input_df = pd.DataFrame(input_data)
        else:
            input_df = input_data

        return self.model.predict(input_df)

    def predict_proba(self, input_data: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]]) -> np.ndarray:
        """Generate prediction probabilities for given input.

        Args:
            input_data (Union[pd.DataFrame, Dict, List[Dict]]): Input feature data.

        Returns:
            np.ndarray: Predicted class probabilities.
        """
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        elif isinstance(input_data, list):
            input_df = pd.DataFrame(input_data)
        else:
            input_df = input_data

        if hasattr(self.model, "predict_proba"):
            return self.model.predict_proba(input_df)
        raise AttributeError("Underlying model does not support predict_proba.")
