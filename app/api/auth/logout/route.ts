import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('auth_token');
  response.cookies.delete('user_info');
  
  return response;
}
