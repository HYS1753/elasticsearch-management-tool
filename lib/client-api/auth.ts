/**
 * Read the current user info from the user_info cookie (client-side only).
 * Returns null if cookie doesn't exist or is invalid.
 */
export function getUserInfoFromCookie(): { user_id: string; name: string; role: string } | null {
  if (typeof document === 'undefined') return null;
  
  const userInfoCookie = document.cookie.split('; ').find(row => row.startsWith('user_info='));
  if (!userInfoCookie) return null;
  
  try {
    const decoded = decodeURIComponent(userInfoCookie.split('=')[1]);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
