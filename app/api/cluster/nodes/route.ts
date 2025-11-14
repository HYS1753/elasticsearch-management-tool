import { NextRequest, NextResponse } from 'next/server';
import { clusterService } from '@/lib/services/cluster.service';

export async function GET(request: NextRequest) {
  try {
    const nodeStats = await clusterService.getNodeStats();
    return NextResponse.json({ success: true, data: nodeStats });
  } catch (error: any) {
    console.error('Error fetching node stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch node stats',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
