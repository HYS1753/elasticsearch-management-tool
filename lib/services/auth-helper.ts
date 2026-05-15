import { cookies } from 'next/headers';

export async function getAuthHeaders() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch (error) {
    // cookies() may throw if called outside of Server Component or API Route context.
    console.warn('Failed to read cookies', error);
  }
  return {};
}
