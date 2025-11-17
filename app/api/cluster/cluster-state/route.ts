import { NextRequest, NextResponse } from 'next/server';
import { clusterService } from '@/lib/services/cluster.service';

export async function GET(request: NextRequest) {
  try {
    const clusterState = await clusterService.getClusterState();
    return NextResponse.json(clusterState);
  } catch (error: any) {
    console.error('Error fetching cluster state:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch cluster state',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
