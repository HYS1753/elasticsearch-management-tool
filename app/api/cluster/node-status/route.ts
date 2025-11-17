import { NextRequest, NextResponse } from 'next/server';
import { clusterService } from '@/lib/services/cluster.service';

export async function GET(request: NextRequest) {
  try {
    const nodeStatus = await clusterService.getNodeStatus();
    return NextResponse.json(nodeStatus);
  } catch (error: any) {
    console.error('Error fetching node status:', error);
    return NextResponse.json(
      {
        code: '500',
        message: error.message || 'Failed to fetch node status',
        data: null,
      },
      { status: 500 }
    );
  }
}
