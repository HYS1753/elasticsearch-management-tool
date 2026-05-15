import { NextRequest, NextResponse } from 'next/server';
import { dictionaryService } from '@/lib/services/dictionary.service';
import type { SearchDictionaryRequest } from '@/types/dictionary';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body: SearchDictionaryRequest = await request.json();
    const result = await dictionaryService.search(type, body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch dictionary search',
        },
      },
      { status: 500 }
    );
  }
}
