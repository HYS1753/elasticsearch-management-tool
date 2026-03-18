import { NextRequest, NextResponse } from 'next/server';
import { indicesService } from '@/lib/services/indices.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const indexName = params.name;
    const index = {} //await indicesService.getIndex(indexName);
    return NextResponse.json({ success: true, data: index });
  } catch (error: any) {
    console.error('Error fetching index:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch index',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const indexName = params.name;
    const response = "" //await indexService.deleteIndex(indexName);
    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error deleting index:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to delete index',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
