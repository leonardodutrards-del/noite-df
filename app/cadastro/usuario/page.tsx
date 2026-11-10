'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (loading) return;
    if (password !== confirmation) { setError('As senhas precisam ser iguais.'); return; }
    setLoading(true);
    const searchParams = new URLSearchParams(window.location.search);
    const accountType = searchParams.get('tipo') === 'estabelecimento' ? 'estabelecimento' : 'usuario';
    const requestedRedirect = searchParams.get('redirect');
    const safeRedirect = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//') ? requestedRedirect : null;
    const nextPath = accountType === 'estabelecimento' ? '/parceiro/onboarding' : (safeRedirect ?? '/');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      if (data.requiresEmailConfirmation) {
        const next = `&redirect=${encodeURIComponent(nextPath)}`;
        router.push(`/login?confirmacao=pendente${next}`);
      } else {
        router.push(nextPath);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container account-page">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/">Página Inicial</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/login">Já tenho conta</Link>
        </nav>
      </header>

      <div style={{ maxWidth: 520, margin: '30px auto 80px' }}>
        <div className="panel account-panel" style={{ padding: 32 }}>
          <span className="badge" style={{ marginBottom: 16 }}>Cadastro de usuário</span>
          <h1 style={{ fontSize: '2.2rem', margin: '8px 0 12px' }}>Crie seu acesso</h1>
          <p style={{ marginBottom: 20, fontSize: 14 }}>
            Use sua conta para acompanhar a programação, favoritar bares e guardar eventos para depois.
          </p>

          <div className="notice" style={{ fontSize: 13, marginBottom: 24, padding: 14 }}>
            Cadastro gratuito para quem quer descobrir a noite, acompanhar eventos e salvar seus lugares favoritos. Você também pode <Link href="/cadastro/estabelecimento">criar uma conta de estabelecimento</Link>.
          </div>

          {error && (
            <div role="alert" className="notice" style={{ borderColor: 'rgba(255, 77, 109, 0.4)', background: 'rgba(255, 77, 109, 0.1)', color: '#ff9d9d', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form className="account-form" aria-busy={loading} onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label htmlFor="partner-name" style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>
                Como podemos chamar você?
              </label>
              <input id="partner-name" autoComplete="name" disabled={loading}                 type="text"
                placeholder="Ex: Carlos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="partner-email" style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>
                Seu e-mail
              </label>
              <input id="partner-email" autoComplete="email" disabled={loading}                 type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label htmlFor="partner-password" style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>
                Senha de acesso (mínimo 12 caracteres)
              </label>
              <input id="partner-password" autoComplete="new-password" disabled={loading}                 type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={12}
                style={{ width: '100%' }}
              />
            </div>

            <div><label htmlFor="confirm-password">Confirme sua senha</label><input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} disabled={loading} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></div>
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 12, padding: 16 }}>
              {loading ? 'Criando sua conta...' : 'Criar conta'}
            </button>
          </form><p className="field-hint">Consulte os <Link href="/termos">Termos de Uso</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</p>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 14, textAlign: 'center' }}>
            <p style={{ margin: 0 }}>
              Já possui conta cadastrada?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
