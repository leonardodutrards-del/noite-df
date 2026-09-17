'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar.');
      }

      const role = data.user?.role;
      if (redirectPath) {
        router.push(redirectPath);
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/parceiro');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ maxWidth: 480, margin: '40px auto 80px' }}>
      <div className="panel" style={{ padding: 32 }}>
        <span className="badge" style={{ marginBottom: 16 }}>Acesso restrito</span>
        <h1 style={{ fontSize: '2.2rem', margin: '8px 0 12px' }}>Entrar no Noite DF</h1>
        <p style={{ marginBottom: 24, fontSize: 14 }}>
          Acesse a área autenticada para gerenciar seu estabelecimento ou administrar o portal.
        </p>

        {error && (
          <div className="notice" style={{ borderColor: 'rgba(255, 77, 109, 0.4)', background: 'rgba(255, 77, 109, 0.1)', color: '#ff9d9d', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>E-mail</label>
            <input
              type="email"
              placeholder="seu@estabelecimento.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, padding: 16 }}>
            {loading ? 'Entrando...' : 'Entrar na Conta'}
          </button>
        </form>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 14 }}>
          <p style={{ margin: 0, marginBottom: 12, textAlign: 'center' }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Visitante?</strong>
            <Link href="/visitante/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Acesso rápido por email
            </Link>
            {' • '}
            <Link href="/visitante/cadastro" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Criar conta
            </Link>
          </p>
        </div>

        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 14, textAlign: 'center' }}>
          <p style={{ margin: 0 }}>
            É dono de estabelecimento e ainda não tem conta?{' '}
            <Link href="/cadastro" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Cadastre seu perfil
            </Link>
          </p>
        </div>


      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="container account-page">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/">Página Inicial</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/cadastro">Cadastre-se</Link>
        </nav>
      </header>
      <Suspense fallback={<div className="container"><p>Carregando...</p></div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
