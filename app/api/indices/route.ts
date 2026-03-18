// import { NextRequest, NextResponse } from 'next/server';
// import { indexService } from '@/lib/services/index.service';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { name, settings, mappings, aliases } = body;

//     if (!name) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: { message: 'Index name is required' },
//         },
//         { status: 400 }
//       );
//     }

//     const response = await indexService.createIndex(name, {
//       settings,
//       mappings,
//       aliases,
//     });

//     return NextResponse.json({ success: true, data: response });
//   } catch (error: any) {
//     console.error('Error creating index:', error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: {
//           message: error.message || 'Failed to create index',
//           details: error,
//         },
//       },
//       { status: 500 }
//     );
//   }
// }
