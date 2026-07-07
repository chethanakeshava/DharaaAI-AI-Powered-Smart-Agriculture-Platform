import { RegisterFormData, LoginFormData, AuthResponse, User } from '@/types/auth';
import { notifyAuthChange } from '@/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class AuthService {
  private readonly TOKEN_KEY = 'dharaa_auth_token';
  private readonly USER_KEY = 'dharaa_user';
  private readonly ROLE_KEY = 'dharaa_user_role';

  async register(formData: RegisterFormData): Promise<AuthResponse> {
    try {
      const url = `${API_BASE_URL}/auth/register`;
      console.log('[Auth] Registering user at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          location: formData.location,
          farm_name: formData.farmName,
          role: formData.role || 'user',
        }),
      });

      console.log('[Auth] Response status:', response.status);

      // Parse response
      let data: any = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('[Auth] Failed to parse JSON response');
      }

      console.log('[Auth] Response data:', data);

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Registration failed (${response.status})`;
        console.error('[Auth] Registration failed:', errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }

      // Success: store token and user
      if (data?.token && data?.user) {
        localStorage.setItem(this.TOKEN_KEY, data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(this.ROLE_KEY, data.user.role || 'user');
        if (data.user.id) {
          localStorage.setItem('user_id', data.user.id);
        }
        console.log('[Auth] Registration successful, token stored');
        notifyAuthChange();
      }

      return {
        success: true,
        message: data?.message || 'Registration successful! Please login.',
        token: data?.token,
        user: data?.user,
      };
    } catch (error) {
      console.error('[Auth] Registration exception:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      return {
        success: false,
        message: `${message}. Please try again.`,
      };
    }
  }

  async login(formData: LoginFormData): Promise<AuthResponse> {
    try {
      const url = `${API_BASE_URL}/auth/login`;
      console.log('[Auth] Logging in at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('[Auth] Response status:', response.status);

      let data: any = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('[Auth] Failed to parse JSON response');
      }

      console.log('[Auth] Response data:', data);

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || 'Login failed';
        console.error('[Auth] Login failed:', errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }

      if (data?.token && data?.user) {
        localStorage.setItem(this.TOKEN_KEY, data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(this.ROLE_KEY, data.user.role || 'user');
        if (data.user.id) {
          localStorage.setItem('user_id', data.user.id);
        }
        console.log('[Auth] Login successful, token stored');
        notifyAuthChange();
      }

      return {
        success: true,
        message: data?.message || 'Login successful!',
        token: data?.token,
        user: data?.user,
      };
    } catch (error) {
      console.error('[Auth] Login exception:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      return {
        success: false,
        message,
      };
    }
  }

  getCurrentUser(): User | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return null;

      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;

      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  async updateProfile(userId: string, updates: Partial<RegisterFormData>): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('[Auth] Failed to parse profile update response');
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.error || 'Profile update failed',
        };
      }

      if (data?.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        notifyAuthChange();
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        user: data?.user,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Profile update failed',
      };
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Not authenticated',
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          currentPassword,
          newPassword,
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('[Auth] Failed to parse password change response');
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.error || 'Password change failed',
        };
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password change failed',
      };
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem('user_id');
    notifyAuthChange();
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
