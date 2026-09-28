'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

export default function RedefinirSenhaPage() {
  const [accessToken, setAccessToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('access_token');
    setAccessToken(token ?? '');
    // The recovery token must not remain in the address bar or browser history.
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 12) {
      setMessage('Use uma senha com pelo menos 12 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setMessage('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/password-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'Não foi possível redefinir a senha.');
      setDone(true);
      setPassword('');
      setConfirmation('');
      setAccessToken('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível redefinir a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 540, paddingTop: 64 }}>
      <Link className="brand" href="/">Noite DF</Link>
      <section className="panel" style={{ marginTop: 32, padding: 32 }}>
        <h1>Redefinir senha</h1>
        {done ? (
          <p>Senha definida. <Link href="/login?redirect=/admin">Entrar na conta</Link></p>
        ) : accessToken ? (
          <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
            <label htmlFor="new-password" style={{ fontWeight: 700 }}>Nova senha</label>
            <input style={{ width: '100%' }} id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} />
            <label htmlFor="confirm-password" style={{ fontWeight: 700 }}>Confirmar nova senha</label>
            <input style={{ width: '100%' }} id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            <button type="submit" disabled={loading} style={{ marginTop: 8 }}>{loading ? 'Salvando...' : 'Definir senha'}</button>
          </form>
        ) : (
          <p>Este link é inválido ou expirou. <Link href="/recuperar-senha">Solicitar outro link</Link></p>
        )}
        {message ? <p role="alert">{message}</p> : null}
      </section>
    </main>
  );
}
