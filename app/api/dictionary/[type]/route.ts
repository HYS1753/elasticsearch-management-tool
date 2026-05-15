import { NextRequest, NextResponse } from 'next/server';
import { dictionaryService } from '@/lib/services/dictionary.service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await request.json();
    const result = await dictionaryService.create(type, body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to create dictionary entry',
        },
      },
      { status: 500 }
    );
  }
}
