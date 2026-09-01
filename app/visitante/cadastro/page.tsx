'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsentForm } from '@/components/ConsentForm';
import type { SignUpVisitorInput } from '@/modules/auth/types';

export default function VisitorSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: SignUpVisitorInput) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch('/api/auth/visitor-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Erro ao criar conta');
      }

      const result = await response.json() as { token: string };

      // Store token
      localStorage.setItem('auth_token', result.token);

      setSuccess(true);

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Bem-vindo à Noite DF
          </h1>
          <p className="text-gray-600 mb-8">
            Cadastre-se para receber promoções, eventos e cortesias dos melhores lugares de Brasília.
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                ✓ Conta criada com sucesso!
              </h2>
              <p className="text-green-800">
                Seu consentimento foi registrado. Você receberá comunicações de acordo com suas preferências.
              </p>
              <p className="text-sm text-gray-600 mt-3">
                Redirecionando para a página inicial...
              </p>
            </div>
          ) : (
            <ConsentForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}

          <hr className="my-8" />

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">📧 Email</h3>
              <p className="text-gray-600">
                Receba promoções especiais, ingressos para eventos e cortesias direto no seu email.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">💬 WhatsApp</h3>
              <p className="text-gray-600">
                Mensagens rápidas e alertas em tempo real sobre seus eventos favoritos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🔒 Sua Privacidade</h3>
              <p className="text-gray-600">
                Seus dados são protegidos pela LGPD. Revogue o consentimento a qualquer momento.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">✅ Sem Compromisso</h3>
              <p className="text-gray-600">
                Navegue como visitante. Controle total sobre como quer nos ouvir.
              </p>
            </div>
          </div>

          <hr className="my-8" />

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="font-semibold text-purple-900 mb-2">
              🚀 É dono de estabelecimento?
            </h2>
            <p className="text-purple-800 text-sm mb-4">
              Faça parte do Noite DF como parceiro e aumente a visibilidade do seu bar, restaurante ou espaço de eventos.
            </p>
            <a
              href="/parceiro/onboarding"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium text-sm"
            >
              Cadastrar Estabelecimento
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
