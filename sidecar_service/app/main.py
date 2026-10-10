from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Optional
from dotenv import load_dotenv

from app.unit_validator import normalize_measurement, UnitConversionRequest, UnitValidationResponse
from app.ai_orchestrator import run_ai_diagnostics, ExperimentDiagnosticRequest, DiagnosticAnalysisResponse

load_dotenv()

app = FastAPI(
    title="Chemical R&D Scientific Engine & Sidecar",
    description="Scientific physical units validator (Pint) & AI diagnostics engine for Chemical Apparatus R&D",
    version="1.0.0"
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
    return {"status": "healthy", "service": "chemical-rd-sidecar"}

@app.post("/api/units/validate", response_model=UnitValidationResponse)
def validate_unit(req: UnitConversionRequest):
    return normalize_measurement(req.value, req.from_unit, req.target_unit)

@app.post("/api/ai/diagnose")
async def diagnose_experiment(req: ExperimentDiagnosticRequest, _: None = Depends(verify_secret)):
    try:
        analysis = await run_ai_diagnostics(req)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
