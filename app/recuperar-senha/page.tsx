'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message ?? 'Se o e-mail estiver cadastrado, enviaremos instruções.');
    } catch {
      setMessage('Não foi possível enviar o e-mail agora.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 540, paddingTop: 64 }}>
      <Link className="brand" href="/">Noite DF</Link>
      <section className="panel" style={{ marginTop: 32, padding: 32 }}>
        <h1>Recuperar senha</h1>
        <p>Enviaremos um link para você definir uma nova senha.</p>
        <form onSubmit={submit}>
          <label htmlFor="recovery-email">E-mail da conta</label>
          <input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar link'}</button>
        </form>
        {message ? <p role="status">{message}</p> : null}
        <Link href="/login">Voltar ao login</Link>
      </section>
    </main>
  );
}
