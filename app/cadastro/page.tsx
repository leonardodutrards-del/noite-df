'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          establishmentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro.');
      }

      router.push('/parceiro');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar parceiro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/">Página Inicial</Link>
          <Link href="/planos">Planos</Link>
          <Link href="/login">Já tenho conta</Link>
        </nav>
      </header>

      <div style={{ maxWidth: 520, margin: '30px auto 80px' }}>
        <div className="panel" style={{ padding: 32 }}>
          <span className="badge" style={{ marginBottom: 16 }}>Parceiro Noite DF</span>
          <h1 style={{ fontSize: '2.2rem', margin: '8px 0 12px' }}>Cadastro de Estabelecimento</h1>
          <p style={{ marginBottom: 20, fontSize: 14 }}>
            Crie sua conta para atualizar horários, agenda, lotação ao vivo e promoções do seu espaço.
          </p>

          <div className="notice" style={{ fontSize: 13, marginBottom: 24, padding: 14 }}>
            🔒 <b>Acesso simplificado:</b> Login direto por e-mail e senha. Não exigimos autenticação em 2 etapas para parceiros.
          </div>

          {error && (
            <div className="notice" style={{ borderColor: 'rgba(255, 77, 109, 0.4)', background: 'rgba(255, 77, 109, 0.1)', color: '#ff9d9d', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>
                Seu nome completo
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo Silveira"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>
                Nome do Estabelecimento
              </label>
              <input
                type="text"
                placeholder="Ex: Bar do Galego, Sunset Gastrobar..."
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>
                E-mail corporativo / comercial
              </label>
              <input
                type="email"
                placeholder="contato@seuestabelecimento.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 14 }}>
                Senha de acesso (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ width: '100%' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 12, padding: 16 }}>
              {loading ? 'Criando sua conta...' : 'Cadastrar e Acessar Painel'}
            </button>
          </form>

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
