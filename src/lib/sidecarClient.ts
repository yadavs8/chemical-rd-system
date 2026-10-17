import {
  UnitValidationRequest,
  UnitValidationResponse,
  UncertaintyRequest,
  UncertaintyEvaluation,
  ExperimentDiagnosticRequest,
  DiagnosticAnalysisResponse
} from '@/types';

/**
 * Sidecar Client for Chemical R&D Physical Science calculations
 * Calls the Next.js API route proxies which route to the Python FastAPI sidecar
 */
export class SidecarClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Validate physical chemical units using Pint (dimensional analysis, SI normalization, differential temps)
   */
  async validateUnit(req: UnitValidationRequest): Promise<UnitValidationResponse> {
    const res = await fetch(`${this.baseUrl}/api/units/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.detail || err.error || 'Failed to validate units via scientific sidecar');
    }

    return res.json();
  }

  /**
   * Evaluates measurement observations against guard-banded tolerance limits (GUM / ISO 14253-1)
   */
  async evaluateUncertainty(req: UncertaintyRequest): Promise<UncertaintyEvaluation> {
    const res = await fetch(`${this.baseUrl}/api/eval/uncertainty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.detail || err.error || 'Failed to evaluate uncertainty via scientific sidecar');
    }

    return res.json();
  }

  /**
   * Runs AI root-cause diagnostics on experiment failure telemetry
   * Automatically falls back to structured heuristic analysis if external API key is absent
   */
  async diagnoseExperiment(req: ExperimentDiagnosticRequest): Promise<DiagnosticAnalysisResponse> {
    const res = await fetch(`${this.baseUrl}/api/ai/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.detail || err.error || 'Failed to run AI diagnostics via scientific sidecar');
    }

    return res.json();
  }
}

export const sidecarClient = new SidecarClient();
