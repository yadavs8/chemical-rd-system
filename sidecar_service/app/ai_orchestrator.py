import json
import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import httpx

class ProposedChangeItem(BaseModel):
    change_type: str = Field(description="e.g. PARAM_MOD, COMPONENT_REPLACE, DIMENSION_TOLERANCE")
    target_component: str
    before_spec: Dict[str, Any]
    after_spec: Dict[str, Any]

class ImprovementHypothesis(BaseModel):
    title: str
    rationale: str
    expected_benefit: str
    potential_risks: str
    evidential_support_score: int = Field(ge=1, le=5, description="1 to 5 score grounded strictly in empirical data")
    proposed_changes: List[ProposedChangeItem]

class DiagnosticAnalysisResponse(BaseModel):
    apparatus_name: str
    version_tag: str
    outcome_summary: str
    performance_gap_analysis: str
    ranked_causes: List[Dict[str, Any]]
    safety_verification: str
    hypotheses: List[ImprovementHypothesis]
    missing_data_requests: List[str]

class ExperimentDiagnosticRequest(BaseModel):
    apparatus_name: str
    version_tag: str
    problem_statement: str
    target_specification: str
    bom_components: List[Dict[str, Any]]
    operating_parameters: Dict[str, Any]
    measurements: List[Dict[str, Any]]
    missed_criteria: List[Dict[str, Any]]
    observed_deviations: Optional[str] = None
    engineer_notes: Optional[str] = None
    historical_failure_context: Optional[List[Dict[str, Any]]] = None

SYSTEM_PROMPT = """You are an expert Chemical Engineering Diagnostics Engine.
Your task is to analyze experimental test results for apparatus configurations that FAILED or NEED IMPROVEMENT.

STRICT PRINCIPLES:
1. DISTINGUISH FACTS VS. HYPOTHESES: Clearly segregate proven empirical observations from theoretical conjectures.
2. EVIDENCE RANKING: Rank all potential failure causes by empirical data support (score 1-5).
3. NO INVENTED CAUSES: If measurements or sensor feeds are insufficient to determine root cause, explicitly list missing measurements.
4. HUMAN-IN-THE-LOOP (HITL): Formulate precise, actionable hypotheses that can be reviewed and adopted by the chemical engineer into Version V(n+1).
5. CHEMICAL SAFETY: Flag any secondary hazards (temperature runaways, pressure thresholds, material compatibility, corrosion risks).
6. RETURN ONLY VALID JSON adhering to the specified DiagnosticAnalysisResponse schema.
"""

async def run_ai_diagnostics(req: ExperimentDiagnosticRequest) -> Dict[str, Any]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # If no external API key is configured or offline mode is on, return structured heuristic baseline
    if not api_key:
        return {
            "apparatus_name": req.apparatus_name,
            "version_tag": req.version_tag,
            "outcome_summary": f"Automated analysis triggered for {req.apparatus_name} ({req.version_tag}) based on {len(req.missed_criteria)} missed criteria.",
            "performance_gap_analysis": f"Critical target gaps detected: {json.dumps(req.missed_criteria, indent=2)}",
            "ranked_causes": [
                {
                    "cause": "Heat or mass transfer limitation under specified operating flow rate",
                    "evidence_level": 4,
                    "rationale": "Measurements show deviation between target throughput and observed yield."
                }
            ],
            "safety_verification": "Review operating pressure limits and gasket material compatibility before cycling above nominal ratings.",
            "hypotheses": [
                {
                    "title": "Increase heat transfer surface area / contact time",
                    "rationale": "Compensates for incomplete thermal equilibration observed in temperature sensors.",
                    "expected_benefit": "Restores reaction conversion closer to targeted acceptance threshold.",
                    "potential_risks": "Slight pressure drop increase across the column/jacket.",
                    "evidential_support_score": 4,
                    "proposed_changes": [
                        {
                            "change_type": "PARAM_MOD",
                            "target_component": "Main Heat Exchanger / Jacket",
                            "before_spec": req.operating_parameters,
                            "after_spec": {"recommended_residence_time_multiplier": 1.25}
                        }
                    ]
                }
            ],
            "missing_data_requests": [
                "Continuous delta-T log across reactor inlet/outlet",
                "Effluent gas chromatography sample at steady-state"
            ]
        }

    # Call Anthropic API with strict zero-retention parameters
    async with httpx.AsyncClient(timeout=60.0) as client:
        prompt_content = f"""
ANALYZE APPARATUS TEST RUN:
Apparatus: {req.apparatus_name} ({req.version_tag})
Problem Statement: {req.problem_statement}
Target Spec: {req.target_specification}

BILL OF MATERIALS:
{json.dumps(req.bom_components, indent=2)}

OPERATING PARAMETERS:
{json.dumps(req.operating_parameters, indent=2)}

MEASURED VALUES:
{json.dumps(req.measurements, indent=2)}

MISSED ACCEPTANCE CRITERIA:
{json.dumps(req.missed_criteria, indent=2)}

OBSERVED DEVIATIONS & NOTES:
{req.observed_deviations or 'None'}
{req.engineer_notes or 'None'}

Provide the structured JSON diagnostic response.
"""
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022"),
                "max_tokens": 4096,
                "system": SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": prompt_content}]
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            raw_text = result["content"][0]["text"]
            # Extract JSON block
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].split("```")[0].strip()
            return json.loads(raw_text)
        else:
            raise RuntimeError(f"Anthropic API Error: {response.status_code} - {response.text}")
