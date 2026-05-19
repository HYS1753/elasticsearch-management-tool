import { NextRequest, NextResponse } from 'next/server';
import { metricsService } from '@/lib/services/metrics.service';

export async function GET(request: NextRequest) {
  try {
    const data = await metricsService.getClusterOverview();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cluster overview';
    console.error('Error fetching cluster overview metrics:', message);
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
