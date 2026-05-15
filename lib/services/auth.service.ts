export class AuthService {
  private apiUrl = process.env.CLUSTER_API_URL || 'http://localhost:18080';

  async login(payload: any) {
    const response = await fetch(`${this.apiUrl}/app/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }

    return data;
  }
}

export const authService = new AuthService();
