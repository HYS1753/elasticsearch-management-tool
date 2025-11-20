import { NextRequest, NextResponse } from 'next/server';
import { indicesService } from '@/lib/services/indices.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeHiddenIndex = searchParams.get('include_hidden_index') === 'false';
    const includeClosedIndex = searchParams.get('include_closed_index') === 'false';

    const result = await indicesService.getIndicesPlacement(
      !includeHiddenIndex,
      !includeClosedIndex
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching indices placement:', error);
    return NextResponse.json(
      {
        code: '500',
        message: error.message || 'Failed to fetch indices placement',
        data: null,
      },
      { status: 500 }
    );
  }
}
