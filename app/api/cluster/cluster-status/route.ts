import { NextRequest, NextResponse } from 'next/server';
import { clusterService } from '@/lib/services/cluster.service';

export async function GET(request: NextRequest) {
  try {
    const clusterStatus = await clusterService.getClusterStatus();
    return NextResponse.json(clusterStatus);
  } catch (error: any) {
    console.error('Error fetching cluster status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch cluster status',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
