import { NextResponse } from 'next/server';

const SIDECAR_URL = process.env.SIDECAR_URL || 'http://127.0.0.1:8000';
const SHARED_SECRET = process.env.SCIENTIFIC_SERVICE_SECRET || 'sec_dev_token_chem_rd_2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${SIDECAR_URL}/api/eval/uncertainty`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-secret': SHARED_SECRET
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Sidecar error: ${response.status}`, detail: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // Graceful local ISO 14253-1 fallback if sidecar service connection is momentarily unavailable
    try {
      const { observations = [], target_value = 0, operator = '>=', instrument_tolerance = 0.05, target_max_value = null } = await request.clone().json();
      const n = observations.length;
      if (n === 0) {
        return NextResponse.json({
          mean: 0, sample_std: 0, type_a_uncertainty: 0, type_b_uncertainty: 0,
          combined_uncertainty: 0, expanded_uncertainty_k2: 0, degrees_of_freedom: 0,
          is_indeterminate: true, verdict: 'MISSING_DATA'
        });
      }
      const meanVal = observations.reduce((a: number, b: number) => a + b, 0) / n;
      const variance = n > 1 ? observations.reduce((a: number, b: number) => a + Math.pow(b - meanVal, 2), 0) / (n - 1) : 0;
      const sampleStd = Math.sqrt(variance);
      const uA = n > 1 ? sampleStd / Math.sqrt(n) : sampleStd;
      const uB = instrument_tolerance / Math.sqrt(3);
      const uc = Math.sqrt(uA * uA + uB * uB);
      const Uk2 = 2.0 * uc;

      let verdict: 'PASSED' | 'FAILED' | 'INDETERMINATE' = 'PASSED';
      let isIndeterminate = false;

      if (operator === '>=') {
        if ((meanVal - Uk2) >= target_value) verdict = 'PASSED';
        else if ((meanVal + Uk2) < target_value) verdict = 'FAILED';
        else { verdict = 'INDETERMINATE'; isIndeterminate = true; }
      } else if (operator === '<=') {
        if ((meanVal + Uk2) <= target_value) verdict = 'PASSED';
        else if ((meanVal - Uk2) > target_value) verdict = 'FAILED';
        else { verdict = 'INDETERMINATE'; isIndeterminate = true; }
      }

      return NextResponse.json({
        mean: Number(meanVal.toFixed(4)),
        sample_std: Number(sampleStd.toFixed(4)),
        type_a_uncertainty: Number(uA.toFixed(4)),
        type_b_uncertainty: Number(uB.toFixed(4)),
        combined_uncertainty: Number(uc.toFixed(4)),
        expanded_uncertainty_k2: Number(Uk2.toFixed(4)),
        degrees_of_freedom: Math.max(1, n - 1),
        is_indeterminate: isIndeterminate,
        verdict
      });
    } catch {
      return NextResponse.json(
        { 
          error: 'Failed to connect to scientific sidecar service', 
          detail: error.message 
        },
        { status: 503 }
      );
    }
  }
}
