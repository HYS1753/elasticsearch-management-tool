import { NextRequest, NextResponse } from 'next/server';

import { indicesService } from '@/lib/services/indices.service';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const indexName = decodeURIComponent(name);
    const body = await request.json();

    const data = await indicesService.executeIndexAction(indexName, body);

    return NextResponse.json({
      code: '200',
      message: 'OK',
      data,
    });
  } catch (error: any) {
    console.error('Error executing index action:', error);

    return NextResponse.json(
      {
        code: '500',
        message: error?.message || 'Failed to execute index action',
        data: null,
      },
      { status: 500 }
    );
  }
}