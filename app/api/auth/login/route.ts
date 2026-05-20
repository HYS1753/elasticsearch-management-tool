import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await authService.login(body);

    // 백엔드 JWT 만료 시간과 동기화 (NEXT_PUBLIC_AUTH_TOKEN_EXPIRE_HOURS, 기본값: 24시간)
    const expireHours = parseInt(process.env.NEXT_PUBLIC_AUTH_TOKEN_EXPIRE_HOURS || '24', 10);
    const maxAgeSeconds = expireHours * 60 * 60;

    // Set cookie
    const response = NextResponse.json({ success: true, user: data });
    
    const isSecure = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_COOKIE_SECURE === 'true';

    // Set HTTPOnly cookie for secure auth
    response.cookies.set({
      name: 'auth_token',
      value: data.access_token,
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    // Also set a user info cookie (not httponly) so the UI can display the username
    response.cookies.set({
      name: 'user_info',
      value: JSON.stringify({ user_id: data.user_id, name: data.name, role: data.role }),
      httpOnly: false,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
