import { NextRequest, NextResponse } from 'next/server';
import { clusterService } from '@/lib/services/cluster.service';

export async function GET(request: NextRequest) {
  try {
    const health = await clusterService.getHealth();
    return NextResponse.json({ success: true, data: health });
  } catch (error: any) {
    console.error('Error fetching cluster health:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch cluster health',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
