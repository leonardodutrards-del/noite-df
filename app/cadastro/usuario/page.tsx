'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CadastroUsuarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get('redirect');
  const redirectPath = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//') ? requestedRedirect : '/';
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
    try {
      const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao realizar cadastro.');
      if (data.requiresEmailConfirmation) router.push(`/login?confirmacao=pendente&redirect=${encodeURIComponent(redirectPath)}`);
      else router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally { setLoading(false); }
  };

  return (
    <main className="container account-page">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><nav><Link href="/cadastro">Trocar tipo de conta</Link><Link href="/login">Já tenho conta</Link></nav></header>
      <div style={{ maxWidth: 520, margin: '38px auto 80px' }}>
        <div className="panel account-panel" style={{ padding: 32 }}>
          <span className="badge">Conta pessoal</span>
          <h1 style={{ fontSize: '2.2rem', margin: '10px 0 12px' }}>Crie sua conta de usuário</h1>
          <p style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.65 }}>Para salvar bares, favoritar eventos e organizar sua programação. Não é necessário cadastrar um estabelecimento.</p>
          {error && <div role="alert" className="notice" style={{ marginBottom: 20 }}>{error}</div>}
          <form className="account-form" aria-busy={loading} onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <label htmlFor="user-name">Seu nome<input id="user-name" autoComplete="name" disabled={loading} type="text" placeholder="Como podemos chamar você?" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%' }} /></label>
            <label htmlFor="user-email">Seu e-mail<input id="user-email" autoComplete="email" disabled={loading} type="email" placeholder="voce@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%' }} /></label>
            <label htmlFor="user-password">Senha (mínimo 12 caracteres)<input id="user-password" autoComplete="new-password" disabled={loading} type="password" placeholder="Crie uma senha segura" value={password} onChange={e => setPassword(e.target.value)} required minLength={12} style={{ width: '100%' }} /></label>
            <label htmlFor="user-confirm-password">Confirme sua senha<input id="user-confirm-password" autoComplete="new-password" disabled={loading} type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} required minLength={12} style={{ width: '100%' }} /></label>
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, padding: 16 }}>{loading ? 'Criando sua conta...' : 'Criar conta de usuário'}</button>
          </form>
          <p className="field-hint">Ao continuar, você concorda com os <Link href="/termos">Termos de Uso</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</p>
        </div>
      </div>
    </main>
  );
}
