import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await authService.login(body);

    // Set cookie
    const response = NextResponse.json({ success: true, user: data });
    
    // Set HTTPOnly cookie for secure auth
    response.cookies.set({
      name: 'auth_token',
      value: data.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours to match backend token expiry
    });

    // Also set a user info cookie (not httponly) so the UI can display the username
    response.cookies.set({
      name: 'user_info',
      value: JSON.stringify({ user_id: data.user_id, name: data.name, role: data.role }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
