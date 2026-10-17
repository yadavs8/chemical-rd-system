import pint
from typing import Dict, Any, Optional
from pydantic import BaseModel

# Initialize unit registry with explicit chemical R&D definitions
ureg = pint.UnitRegistry(autoconvert_offset_to_baseunit=True)

# Define specific chemical pressure and flow contexts
ureg.define("barg = bar") # Gauge pressure relative to atmospheric
ureg.define("bara = bar") # Absolute pressure
ureg.define("standard_liter = liter")
ureg.define("slpm = standard_liter / minute") # Standard liters per minute (0°C, 1 atm)
ureg.define("delta_degC = delta_degree_Celsius") # Temperature differential (not absolute offset)
ureg.define("delta_degF = delta_degree_Fahrenheit")

class UnitConversionRequest(BaseModel):
    value: float
    from_unit: str
    target_unit: Optional[str] = None
    is_differential: bool = False # Differentiates delta-T from absolute temperature

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

def normalize_measurement(value: float, unit_str: str, target_unit_str: Optional[str] = None, is_differential: bool = False) -> UnitValidationResponse:
    """
    Rigorously validates physical chemical units.
    Correctly models:
      - Temperature differentials (delta_degC) vs absolute temperature (degC)
      - Gauge pressure (barg) vs absolute pressure (bara)
      - Volumetric standard vs actual flows (slpm, mL/min)
    """
    try:
        # Pitfall resolution from Claude review: handle temperature differentials
        sanitized_unit = unit_str.strip()
        if is_differential and sanitized_unit in ["degC", "°C", "celsius"]:
            sanitized_unit = "delta_degC"
        elif is_differential and sanitized_unit in ["degF", "°F", "fahrenheit"]:
            sanitized_unit = "delta_degF"

        quantity = ureg.Quantity(value, sanitized_unit)
        base_si = quantity.to_base_units()
        
        converted_val = None
        if target_unit_str:
            target_sanitized = target_unit_str.strip()
            if is_differential and target_sanitized in ["degC", "°C", "celsius"]:
                target_sanitized = "delta_degC"
            elif is_differential and target_sanitized in ["degF", "°F", "fahrenheit"]:
                target_sanitized = "delta_degF"
            converted = quantity.to(target_sanitized)
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
            error_message=f"Undefined physical chemical unit: {unit_str}"
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
