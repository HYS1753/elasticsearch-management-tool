import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/services/document.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { index: string; id: string } }
) {
  try {
    const { index, id } = params;
    const document = await documentService.getDocument(index, id);
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to fetch document',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { index: string; id: string } }
) {
  try {
    const { index, id } = params;
    const body = await request.json();
    const { doc, script, refresh } = body;

    const response = await documentService.updateDocument({
      index,
      id,
      doc,
      script,
      refresh,
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to update document',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { index: string; id: string } }
) {
  try {
    const { index, id } = params;
    const response = await documentService.deleteDocument({ index, id, refresh: true });
    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || 'Failed to delete document',
          details: error,
        },
      },
      { status: 500 }
    );
  }
}
