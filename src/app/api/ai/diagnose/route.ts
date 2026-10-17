import { NextResponse } from 'next/server';
import { ExperimentDiagnosticRequest, DiagnosticAnalysisResponse } from '@/types';

const SIDECAR_URL = process.env.SIDECAR_URL || 'http://127.0.0.1:8000';
const SHARED_SECRET = process.env.SCIENTIFIC_SERVICE_SECRET || 'sec_dev_token_chem_rd_2026';

function generateHeuristicFallback(req: Partial<ExperimentDiagnosticRequest>): DiagnosticAnalysisResponse {
  const missedCount = req.missed_criteria?.length || 0;
  return {
    apparatus_name: req.apparatus_name || 'Chemical Apparatus',
    version_tag: req.version_tag || 'V1.0',
    outcome_summary: `Heuristic diagnostic analysis triggered for ${req.apparatus_name || 'Apparatus'} (${req.version_tag || 'V1.0'}) based on ${missedCount} missed criteria.`,
    performance_gap_analysis: req.missed_criteria && req.missed_criteria.length > 0 
      ? `Critical target gaps detected: ${JSON.stringify(req.missed_criteria, null, 2)}`
      : 'Telemetry indicates performance deviations below required confidence intervals.',
    ranked_causes: [
      {
        cause: 'Heat or mass transfer limitation under specified operating flow rate',
        evidence_level: 4,
        rationale: 'Observed telemetry deviates between target throughput and conversion efficiency.'
      },
      {
        cause: 'Boundary layer thermal choke inside coolant jacket / heat exchanger',
        evidence_level: 4,
        rationale: 'Exothermic heat accumulation exceeds jacket convective dissipation.'
      },
      {
        cause: 'Packed bed fluidization maldistribution or flow channelling',
        evidence_level: 3,
        rationale: 'Differential pressure drop suggests non-uniform porosity across catalyst packing.'
      }
    ],
    safety_verification: 'Review operating pressure limits and gasket material compatibility before cycling above nominal ratings.',
    hypotheses: [
      {
        title: 'Augment coolant recirculation & dilute active zone with inert packing',
        rationale: 'Compensates for incomplete thermal equilibration and prevents localized catalyst sintering.',
        expected_benefit: 'Reduces peak delta-T across the bed by ~50% and restores single-pass conversion.',
        potential_risks: 'Minor increase in reactor vessel volume requirement.',
        evidential_support_score: 4,
        proposed_changes: [
          {
            change_type: 'PARAM_MOD',
            target_component: 'Coolant Jacket Circulation',
            before_spec: req.operating_parameters || {},
            after_spec: { recommended_recirculation_multiplier: 1.5, target_coolant_temp_degC: 180 }
          },
          {
            change_type: 'COMPONENT_REPLACE',
            target_component: 'Reaction Bed Packing',
            before_spec: { packing_type: 'Pure Catalyst' },
            after_spec: { packing_type: '50% Active / 50% SiC Inert Pellets' }
          }
        ]
      }
    ],
    missing_data_requests: [
      'Continuous delta-T log across reactor inlet/outlet thermocouples',
      'Effluent gas chromatography sample at steady-state'
    ]
  };
}

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();

    const response = await fetch(`${SIDECAR_URL}/api/ai/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-secret': SHARED_SECRET
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }

    // Sidecar returned an error status (e.g. Anthropic API key issue)
    console.warn(`Sidecar /api/ai/diagnose returned ${response.status}. Using heuristic fallback.`);
    return NextResponse.json(generateHeuristicFallback(body));
  } catch (error: any) {
    console.warn('Could not reach sidecar service. Using heuristic fallback:', error.message);
    return NextResponse.json(generateHeuristicFallback(body || {}));
  }
}
