import { NextRequest, NextResponse } from 'next/server';

import { documentsService } from '@/lib/services/documents.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await documentsService.searchDocuments(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error searching documents:', error);

    return NextResponse.json(
      {
        code: '500',
        message: error?.message || 'Failed to search documents',
        data: null,
      },
      { status: 500 }
    );
  }
}