from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Optional, List
from dotenv import load_dotenv

from app.unit_validator import normalize_measurement, UnitConversionRequest, UnitValidationResponse
from app.ai_orchestrator import run_ai_diagnostics, ExperimentDiagnosticRequest, DiagnosticAnalysisResponse
from app.uncertainty_engine import evaluate_guard_banded_criterion, UncertaintyEvaluation

load_dotenv()

app = FastAPI(
    title="Chemical R&D Scientific Engine & Sidecar",
    description="Scientific physical units validator (Pint), GUM / ISO 14253-1 guard-banded uncertainty evaluator, and AI diagnostics engine for Chemical Apparatus R&D",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SHARED_SECRET = os.getenv("SCIENTIFIC_SERVICE_SECRET", "sec_dev_token_chem_rd_2026")

def verify_secret(x_service_secret: Optional[str] = Header(None)):
    if x_service_secret and x_service_secret != SHARED_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized service secret")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "chemical-rd-sidecar", "version": "1.1.0"}

@app.post("/api/units/validate", response_model=UnitValidationResponse)
def validate_unit(req: UnitConversionRequest):
    return normalize_measurement(req.value, req.from_unit, req.target_unit, req.is_differential)

@app.post("/api/eval/uncertainty", response_model=UncertaintyEvaluation)
def evaluate_uncertainty(
    observations: List[float],
    target_value: float,
    operator: str = ">=",
    instrument_tolerance: float = 0.05
):
    return evaluate_guard_banded_criterion(observations, target_value, operator, instrument_tolerance)

@app.post("/api/ai/diagnose")
async def diagnose_experiment(req: ExperimentDiagnosticRequest, _: None = Depends(verify_secret)):
    try:
        analysis = await run_ai_diagnostics(req)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
