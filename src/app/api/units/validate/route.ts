import { NextResponse } from 'next/server';

const SIDECAR_URL = process.env.SIDECAR_URL || 'http://127.0.0.1:8000';
const SHARED_SECRET = process.env.SCIENTIFIC_SERVICE_SECRET || 'sec_dev_token_chem_rd_2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${SIDECAR_URL}/api/units/validate`, {
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
    return NextResponse.json(
      { 
        error: 'Failed to connect to scientific sidecar service', 
        detail: error.message,
        hint: 'Ensure Python sidecar is running at ' + SIDECAR_URL
      },
      { status: 503 }
    );
  }
}
