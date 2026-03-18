import { NextRequest, NextResponse } from 'next/server';
import { queryExplainService } from '@/lib/services/query-explain.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await queryExplainService.getExplainDetail(body);

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch explain detail',
        },
      },
      { status: 500 }
    );
  }
}