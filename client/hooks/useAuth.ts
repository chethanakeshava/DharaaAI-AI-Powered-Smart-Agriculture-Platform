import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { authService } from '@/services/authService';

// Auth state change event system
type AuthChangeListener = () => void;
const authListeners = new Set<AuthChangeListener>();

export function notifyAuthChange() {
  authListeners.forEach(listener => listener());
}

export function subscribeToAuthChanges(listener: AuthChangeListener): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshAuth = () => {
    const currentUser = authService.getCurrentUser();
    const role = authService.getUserRole();
    if (currentUser) {
      setUser({
        ...currentUser,
        role: (role as 'admin' | 'user' | undefined) || 'user',
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial load
    refreshAuth();

    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges(refreshAuth);
    return unsubscribe;
  }, []);

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    notifyAuthChange();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    setUser,
  };
}
