import { NextRequest, NextResponse } from 'next/server';
import { clusterService } from '@/lib/services/cluster.service';

export async function GET(request: NextRequest) {
  try {
    const stats = await clusterService.getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching cluster stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch cluster stats',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
