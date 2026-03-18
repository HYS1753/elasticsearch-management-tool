import { NextRequest, NextResponse } from 'next/server';
import { indicesService } from '@/lib/services/indices.service';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const indexName = decodeURIComponent(name);

    const data = await indicesService.getIndexDetail(indexName);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching index detail:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: error?.message || 'Failed to fetch index detail',
        },
      },
      { status: 500 }
    );
  }
}