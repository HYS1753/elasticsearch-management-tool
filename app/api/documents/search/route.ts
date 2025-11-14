import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/services/document.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { index, query, from, size, sort } = body;

    if (!index) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Index name is required' },
        },
        { status: 400 }
      );
    }

    const response = await documentService.search({
      index,
      query: query || { match_all: {} },
      from: from || 0,
      size: size || 10,
      sort,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to search documents',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
