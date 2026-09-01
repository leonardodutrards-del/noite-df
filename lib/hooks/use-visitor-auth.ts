import { useCallback, useEffect, useState } from 'react';
import type { AuthUser } from '@/modules/auth/types';

export function useVisitorAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há token no localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (token) {
      // TODO: Validar token no servidor
      setUser(null); // Placeholder
    }

    setIsLoading(false);
  }, []);

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
