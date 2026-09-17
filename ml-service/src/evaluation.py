import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)

# ==============================================================================
# ML Evaluation Metrics for Cybercrime Hotspot Alerting
# 
# As highlighted in the system blueprint:
# In high-stakes cybercrime / ATM fraud alerting, class distributions are heavily
# imbalanced (normal events vastly outnumber crime incidents). A naive classifier
# predicting 0 (no incident) could achieve 95%+ accuracy while failing completely.
#
# Core evaluation criteria:
# 1. Precision : Avoid alert fatigue and false police dispatches
# 2. Recall    : Catch active fraud occurrences and high-risk hotspots
# 3. F1-Score  : Harmonic balance between Precision and Recall
# 4. ROC-AUC   : Discriminative power across all classification thresholds
# 5. PR-AUC    : Crucial metric for imbalanced positive fraud events
# ==============================================================================


def evaluate_predictions(
    y_true: np.ndarray, 
    y_pred: np.ndarray, 
    y_proba: Optional[np.ndarray] = None,
    pos_label: int = 1
) -> Dict[str, Any]:
    """Evaluate classification performance focusing on precision, recall, F1, ROC-AUC, and PR-AUC.

    Args:
        y_true (np.ndarray): Ground truth labels (0 = Normal, 1 = Incident/Fraud).
        y_pred (np.ndarray): Binary model predictions.
        y_proba (Optional[np.ndarray]): Probability predictions.
        pos_label (int): Positive class label indicating incident (default 1).

    Returns:
        Dict[str, Any]: Metric dictionary with precision, recall, f1, roc_auc, pr_auc.
    """
    y_true_arr = np.asarray(y_true)
    y_pred_arr = np.asarray(y_pred)

    # Core threshold-dependent metrics
    precision = float(precision_score(y_true_arr, y_pred_arr, pos_label=pos_label, zero_division=0))
    recall = float(recall_score(y_true_arr, y_pred_arr, pos_label=pos_label, zero_division=0))
    f1 = float(f1_score(y_true_arr, y_pred_arr, pos_label=pos_label, zero_division=0))
    accuracy = float(accuracy_score(y_true_arr, y_pred_arr))

    metrics: Dict[str, Any] = {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "accuracy": accuracy,
        "precision_macro": float(precision_score(y_true_arr, y_pred_arr, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y_true_arr, y_pred_arr, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y_true_arr, y_pred_arr, average="macro", zero_division=0)),
        "confusion_matrix": confusion_matrix(y_true_arr, y_pred_arr).tolist(),
        "classification_report": classification_report(y_true_arr, y_pred_arr, output_dict=True, zero_division=0)
    }

    # Probability-based metrics: ROC-AUC and PR-AUC
    if y_proba is not None:
        proba_arr = np.asarray(y_proba)
        
        # Extract probability of positive incident class
        if proba_arr.ndim == 2 and proba_arr.shape[1] > 1:
            pos_proba = proba_arr[:, pos_label] if proba_arr.shape[1] > pos_label else proba_arr[:, 1]
        else:
            pos_proba = proba_arr.ravel()

        try:
            metrics["roc_auc"] = float(roc_auc_score(y_true_arr, pos_proba))
        except Exception as e:
            metrics["roc_auc"] = None
            metrics["roc_auc_error"] = str(e)

        try:
            # PR-AUC / Average Precision Score
            metrics["pr_auc"] = float(average_precision_score(y_true_arr, pos_proba))
        except Exception as e:
            metrics["pr_auc"] = None
            metrics["pr_auc_error"] = str(e)
    else:
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None

    return metrics


def print_evaluation_summary(metrics: Dict[str, Any]) -> None:
    """Print clean terminal summary of all 5 critical evaluation metrics.

    Args:
        metrics (Dict[str, Any]): Evaluated metrics dictionary.
    """
    print("\n==================================================")
    print("      CYBERCRIME HOTSPOT EVALUATION METRICS       ")
    print("==================================================")
    print(f"  Precision (Fraud Class): {metrics.get('precision', 0.0):.4f}")
    print(f"  Recall    (Fraud Class): {metrics.get('recall', 0.0):.4f}")
    print(f"  F1-Score  (Fraud Class): {metrics.get('f1', 0.0):.4f}")
    
    roc = metrics.get('roc_auc')
    roc_str = f"{roc:.4f}" if roc is not None else "N/A"
    print(f"  ROC-AUC                : {roc_str}")

    pr = metrics.get('pr_auc')
    pr_str = f"{pr:.4f}" if pr is not None else "N/A"
    print(f"  PR-AUC                 : {pr_str}")

    print("--------------------------------------------------")
    print(f"  Accuracy (Reference)   : {metrics.get('accuracy', 0.0):.4f}")
    print("  * Note: Accuracy alone is not an authoritative")
    print("    metric due to severe fraud class imbalance.")
    print("==================================================\n")
