import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/services/document.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { index, id, document, refresh } = body;

    if (!index || !document) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Index and document are required' },
        },
        { status: 400 }
      );
    }

    const response = await documentService.indexDocument({
      index,
      id,
      document,
      refresh,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error indexing document:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to index document',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
