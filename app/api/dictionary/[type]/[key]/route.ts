import { NextRequest, NextResponse } from 'next/server';
import { dictionaryService } from '@/lib/services/dictionary.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; key: string }> }
) {
  try {
    const { type, key } = await params;
    const body = await request.json();
    const result = await dictionaryService.update(type, decodeURIComponent(key), body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to update dictionary entry',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; key: string }> }
) {
  try {
    const { type, key } = await params;
    const result = await dictionaryService.remove(type, decodeURIComponent(key));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to delete dictionary entry',
        },
      },
      { status: 500 }
    );
  }
}
