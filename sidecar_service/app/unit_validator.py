import pint
from typing import Dict, Any, Optional
from pydantic import BaseModel

ureg = pint.UnitRegistry()

class UnitConversionRequest(BaseModel):
    value: float
    from_unit: str
    target_unit: Optional[str] = None

class UnitValidationResponse(BaseModel):
    is_valid: bool
    original_value: float
    original_unit: str
    base_si_value: Optional[float] = None
    base_si_unit: Optional[str] = None
    converted_value: Optional[float] = None
    converted_unit: Optional[str] = None
    dimensionality: Optional[str] = None
    error_message: Optional[str] = None

def normalize_measurement(value: float, unit_str: str, target_unit_str: Optional[str] = None) -> UnitValidationResponse:
    """
    Validates physical chemical units, calculates the normalized base SI equivalent,
    and converts to an optional target unit using Pint.
    """
    try:
        quantity = value * ureg(unit_str)
        base_si = quantity.to_base_units()
        
        converted_val = None
        if target_unit_str:
            converted = quantity.to(target_unit_str)
            converted_val = float(converted.magnitude)

        return UnitValidationResponse(
            is_valid=True,
            original_value=value,
            original_unit=str(quantity.units),
            base_si_value=float(base_si.magnitude),
            base_si_unit=str(base_si.units),
            converted_value=converted_val,
            converted_unit=target_unit_str,
            dimensionality=str(quantity.dimensionality),
            error_message=None
        )
    except pint.UndefinedUnitError as e:
        return UnitValidationResponse(
            is_valid=False,
            original_value=value,
            original_unit=unit_str,
            error_message=f"Undefined chemical or physical unit: {unit_str}"
        )
    except pint.DimensionalityError as e:
        return UnitValidationResponse(
            is_valid=False,
            original_value=value,
            original_unit=unit_str,
            error_message=f"Dimensionality mismatch: cannot convert {unit_str} to {target_unit_str}"
        )
    except Exception as e:
        return UnitValidationResponse(
            is_valid=False,
            original_value=value,
            original_unit=unit_str,
            error_message=str(e)
        )
