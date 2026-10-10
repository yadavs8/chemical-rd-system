import numpy as np
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel

class UncertaintyEvaluation(BaseModel):
    mean: float
    sample_std: float # s
    type_a_uncertainty: float # u_A = s / sqrt(n)
    type_b_uncertainty: float # u_B (instrument resolution / calibration)
    combined_uncertainty: float # u_c = sqrt(u_A^2 + u_B^2)
    expanded_uncertainty_k2: float # U (k=2, 95% confidence)
    degrees_of_freedom: int
    is_indeterminate: bool
    verdict: str

def evaluate_guard_banded_criterion(
    observations: List[float],
    target_value: float,
    operator: str, # ">=", "<=", "==", "RANGE"
    instrument_tolerance: float = 0.05,
    target_max_value: float = None
) -> UncertaintyEvaluation:
    """
    Implements GUM / JCGM 100 & ISO 14253-1 / ILAC-G8 guard-banded decision rules:
    - Calculates Student-t Type A uncertainty combined with Type B instrument uncertainty.
    - Flags results whose uncertainty band overlaps the specification boundary as 'INDETERMINATE'.
    """
    n = len(observations)
    if n == 0:
        return UncertaintyEvaluation(
            mean=0.0, sample_std=0.0, type_a_uncertainty=0.0, type_b_uncertainty=0.0,
            combined_uncertainty=0.0, expanded_uncertainty_k2=0.0, degrees_of_freedom=0,
            is_indeterminate=True, verdict="MISSING_DATA"
        )
    
    mean_val = float(np.mean(observations))
    sample_std = float(np.std(observations, ddof=1)) if n > 1 else 0.0
    u_A = sample_std / np.sqrt(n) if n > 1 else sample_std
    u_B = instrument_tolerance / np.sqrt(3) # Rectangular distribution assumption for instrument resolution
    u_c = float(np.sqrt(u_A**2 + u_B**2))
    U_k2 = float(2.0 * u_c) # k=2 coverage factor (~95% coverage)

    # ISO 14253-1 Guard-Banded Decision Rules
    verdict = "PASSED"
    is_indeterminate = False

    if operator == ">=":
        # Safe Pass: (mean - U) >= target
        if (mean_val - U_k2) >= target_value:
            verdict = "PASSED"
        # Safe Fail: (mean + U) < target
        elif (mean_val + U_k2) < target_value:
            verdict = "FAILED"
        # Overlapping boundary: Indeterminate region
        else:
            verdict = "INDETERMINATE"
            is_indeterminate = True

    elif operator == "<=":
        # Safe Pass: (mean + U) <= target
        if (mean_val + U_k2) <= target_value:
            verdict = "PASSED"
        # Safe Fail: (mean - U) > target
        elif (mean_val - U_k2) > target_value:
            verdict = "FAILED"
        else:
            verdict = "INDETERMINATE"
            is_indeterminate = True

    return UncertaintyEvaluation(
        mean=round(mean_val, 4),
        sample_std=round(sample_std, 4),
        type_a_uncertainty=round(u_A, 4),
        type_b_uncertainty=round(u_B, 4),
        combined_uncertainty=round(u_c, 4),
        expanded_uncertainty_k2=round(U_k2, 4),
        degrees_of_freedom=max(1, n - 1),
        is_indeterminate=is_indeterminate,
        verdict=verdict
    )
