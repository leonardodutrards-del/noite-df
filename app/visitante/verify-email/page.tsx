'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Redirecionar para o endpoint de verificação
      router.push(`/visitante/login?token=${token}`);
    }
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Verificando seu email...
        </h1>
        <p className="text-gray-600">
          Por favor, aguarde enquanto verificamos seu link de acesso.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
