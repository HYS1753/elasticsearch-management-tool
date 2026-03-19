import { NextResponse } from 'next/server';

import { documentsService } from '@/lib/services/documents.service';

export async function GET() {
  try {
    const result = await documentsService.getDocumentIndices();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching document indices:', error);

    return NextResponse.json(
      {
        code: '500',
        message: error?.message || 'Failed to fetch document indices',
        data: null,
      },
      { status: 500 }
    );
  }
}