import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)


def evaluate_predictions(
    y_true: np.ndarray, 
    y_pred: np.ndarray, 
    y_proba: Optional[np.ndarray] = None
) -> Dict[str, Any]:
    """Evaluate classification performance metrics.

    Args:
        y_true (np.ndarray): Ground truth labels.
        y_pred (np.ndarray): Predicted labels.
        y_proba (Optional[np.ndarray]): Predicted probabilities.

    Returns:
        Dict[str, Any]: Dictionary containing evaluation metrics.
    """
    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_macro": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        "classification_report": classification_report(y_true, y_pred, output_dict=True, zero_division=0)
    }

    if y_proba is not None:
        try:
            if y_proba.ndim == 2 and y_proba.shape[1] == 2:
                metrics["roc_auc"] = float(roc_auc_score(y_true, y_proba[:, 1]))
            else:
                metrics["roc_auc"] = float(roc_auc_score(y_true, y_proba, multi_class="ovr"))
        except Exception as e:
            metrics["roc_auc"] = None
            metrics["roc_auc_error"] = str(e)

    return metrics


def print_evaluation_summary(metrics: Dict[str, Any]) -> None:
    """Print readable summary of evaluation metrics.

    Args:
        metrics (Dict[str, Any]): Evaluation metrics dictionary.
    """
    print("\n--- Model Evaluation Summary ---")
    print(f"Accuracy:        {metrics.get('accuracy', 0.0):.4f}")
    print(f"Precision (Avg): {metrics.get('precision_macro', 0.0):.4f}")
    print(f"Recall (Avg):    {metrics.get('recall_macro', 0.0):.4f}")
    print(f"F1 Score (Avg):  {metrics.get('f1_macro', 0.0):.4f}")
    if "roc_auc" in metrics and metrics["roc_auc"] is not None:
        print(f"ROC-AUC:         {metrics['roc_auc']:.4f}")
    print("--------------------------------\n")
