import { useCallback, useState } from 'react';
import type { AuthUser } from '@/modules/auth/types';

export function useVisitorAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const isLoading = false;
  const [error, setError] = useState<string | null>(null);

  // Session restoration is not implemented in this hook.
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const revokeConsent = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Não autenticado.');
      }

      const response = await fetch('/api/auth/consent/revoke', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao revogar consentimento.');
      }

      logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revogar consentimento.');
    }
  }, [logout]);

  return {
    user,
    isLoading,
    error,
    logout,
    revokeConsent,
    isAuthenticated: !!user,
  };
}
