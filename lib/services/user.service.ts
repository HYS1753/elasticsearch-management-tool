import { getAuthHeaders } from './auth-helper';

export class UserService {
  private apiUrl = process.env.CLUSTER_API_URL;

  async getUsers(skip: number = 0, limit: number = 100) {
    const authHeaders = await getAuthHeaders();
    const query = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    
    const response = await fetch(`${this.apiUrl}/app/auth/users?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || `Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  }

  async createUser(payload: any) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${this.apiUrl}/app/auth/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || 'Failed to create user');
    }

    return await response.json();
  }

  async updateUser(userId: string, payload: any) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${this.apiUrl}/app/auth/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || 'Failed to update user');
    }

    return await response.json();
  }

  async updateMyProfile(payload: { name?: string; password?: string }) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${this.apiUrl}/app/auth/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || 'Failed to update profile');
    }

    return await response.json();
  }

  async deleteUser(userId: string) {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${this.apiUrl}/app/auth/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || 'Failed to delete user');
    }

    return await response.json();
  }
}

export const userService = new UserService();
