'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { VisitorLoginInput } from '@/modules/auth/types';

function VisitorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [step, setStep] = useState<'email' | 'verify' | 'success'>('email');

  // Se há token na URL, verificar automaticamente
  useEffect(() => {
    if (token) {
      handleVerifyToken(token);
    }
  }, [token]);

  const handleVerifyToken = async (verificationToken: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch(`/api/auth/verify-token?token=${verificationToken}`);

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Link inválido ou expirado');
      }

      const data = await response.json() as { token?: string; user?: { email: string } };

      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setStep('success');
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar link');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);
    setMessage(undefined);

    try {
      const input: VisitorLoginInput = { email };

      const response = await fetch('/api/auth/visitor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Erro ao solicitar link');
      }

      setMessage('✉️ Verifique seu email para o link de acesso!');
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao solicitar link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Bem-vindo de Volta
        </h1>
        <p className="text-gray-600 mb-6">
          Acesso rápido como visitante
        </p>

        {step === 'email' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Enviando link...' : 'Enviar Link de Acesso'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✉️ Verifique seu email em <strong>{email}</strong>
              </p>
              <p className="text-xs text-blue-700 mt-2">
                O link expira em 15 minutos
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Não vê o email?
              </p>
              <button
                onClick={() => {
                  setStep('email');
                  setMessage(undefined);
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
              >
                Tentar Outro Email
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              ✓ Login Realizado!
            </h2>
            <p className="text-green-800 text-sm">
              Bem-vindo! Você será redirecionado em breve.
            </p>
          </div>
        )}

        {message && step !== 'verify' && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600">
            Novo por aqui?{' '}
            <a href="/visitante/cadastro" className="text-blue-600 hover:underline font-medium">
              Crie sua conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VisitorLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <VisitorLoginContent />
    </Suspense>
  );
}
