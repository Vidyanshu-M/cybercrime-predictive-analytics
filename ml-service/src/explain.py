import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, List


def get_feature_importance(model: Any, feature_names: List[str]) -> pd.DataFrame:
    """Extract and sort feature importances from a trained tree-based model or pipeline.

    Args:
        model (Any): Trained estimator or Pipeline.
        feature_names (List[str]): List of feature column names.

    Returns:
        pd.DataFrame: Dataframe with feature names and importance values sorted descending.
    """
    estimator = model
    if hasattr(model, "named_steps") and "classifier" in model.named_steps:
        estimator = model.named_steps["classifier"]

    if hasattr(estimator, "feature_importances_"):
        importances = estimator.feature_importances_
        df_importance = pd.DataFrame({
            "feature": feature_names[:len(importances)],
            "importance": importances
        }).sort_values(by="importance", ascending=False).reset_index(drop=True)
        return df_importance
    elif hasattr(estimator, "coef_"):
        coef = np.abs(estimator.coef_).mean(axis=0)
        df_importance = pd.DataFrame({
            "feature": feature_names[:len(coef)],
            "importance": coef
        }).sort_values(by="importance", ascending=False).reset_index(drop=True)
        return df_importance
    else:
        raise AttributeError("Estimator does not have feature_importances_ or coef_ attribute.")


def explain_prediction_shap(
    model: Any, 
    background_data: pd.DataFrame, 
    instance: pd.DataFrame
) -> Dict[str, Any]:
    """Generate SHAP explanation values for a specific prediction instance.

    Args:
        model (Any): Model or estimator.
        background_data (pd.DataFrame): Reference sample for TreeExplainer / KernelExplainer.
        instance (pd.DataFrame): The single record or batch to explain.

    Returns:
        Dict[str, Any]: Explanation summary dictionary.
    """
    try:
        import shap
        explainer = shap.Explainer(model, background_data)
        shap_values = explainer(instance)
        return {
            "values": shap_values.values.tolist(),
            "base_values": shap_values.base_values.tolist() if hasattr(shap_values.base_values, "tolist") else shap_values.base_values,
            "feature_names": instance.columns.tolist()
        }
    except Exception as e:
        return {"error": str(e), "message": "SHAP explanation generation failed."}
