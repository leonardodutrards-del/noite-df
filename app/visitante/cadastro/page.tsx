'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConsentForm } from '@/components/ConsentForm';
import type { SignUpVisitorInput } from '@/modules/auth/types';

export default function VisitorSignupPage() {
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
      if (result.token) localStorage.setItem('auth_token', result.token);

      setSuccess(true);


    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container account-page">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><nav aria-label="Conta"><Link href="/">Explorar lugares</Link><Link href="/visitante/login">Já tenho conta</Link></nav></header>
      <section className="panel account-panel">
        <span className="badge">Para quem quer sair</span><h1>Crie sua conta de visitante</h1><p>Escolha como deseja receber novidades sobre lugares e experiências no DF.</p>
        <div className="account-switch"><strong>Você representa um estabelecimento?</strong><Link href="/cadastro">Criar conta de parceiro →</Link><Link href="/">Explorar sem criar conta</Link></div>
        {success ? <div className="notice" role="status"><h2>Conta criada!</h2><p>Suas preferências foram registradas.</p><Link className="button" href="/">Explorar lugares</Link></div> : <ConsentForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />}
        <p>Já possui conta? <Link href="/visitante/login">Entrar como visitante</Link></p>
      </section>
    </main>
  );
}
