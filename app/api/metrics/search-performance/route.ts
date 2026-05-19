import { NextRequest, NextResponse } from 'next/server';
import { metricsService } from '@/lib/services/metrics.service';
import type { TimeRange } from '@/types/metrics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = (searchParams.get('time_range') || '1h') as TimeRange;
    const step = searchParams.get('step') || undefined;

    const data = await metricsService.getSearchPerformance(timeRange, step);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch search performance';
    console.error('Error fetching search performance metrics:', message);
    return NextResponse.json(
      { success: false, error: { message } },
      { status: 500 }
    );
  }
}
