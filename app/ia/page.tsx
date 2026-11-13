'use client';
import Link from 'next/link';

import { useState, type FormEvent } from 'react';

type Suggestion = { id: string; name: string; region: string; type: string; description: string; price?: string; reasons: string[] };
type ResponseData = { aiReply?: string | null; mode?: string; message?: string; suggestions?: Suggestion[]; disclaimer?: string; notices?: string[]; clarification?: string; error?: string };

export default function ConciergePage() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || message.trim().length < 3) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/ai/concierge', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });
      const data = (await response.json()) as ResponseData;
      setResult(response.ok ? data : { error: data.error || 'Não foi possível consultar agora.' });
    } catch {
      setResult({ error: 'Falha de conexão. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '48px 20px', minHeight: '100vh', color: '#f7f4ff' }}>
      <Link href="/" style={{ color: '#c7b6ff' }}>← Voltar ao Noite DF</Link>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginTop: 32 }}>Descubra seu próximo rolê ✨</h1>
      <p style={{ color: '#c4c0cc', lineHeight: 1.6 }}>Conte o que procura: bairro, música, ambiente ou tipo de lugar. O Concierge consulta apenas locais publicados no Noite DF.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 28 }}>
        <label htmlFor="concierge-message">O que você quer fazer?</label>
        <textarea id="concierge-message" maxLength={500} rows={3} value={message} onChange={(event) => setMessage(event.target.value)}
          placeholder="Ex.: Quero um bar com sertanejo na Asa Sul" style={{ width: '100%', borderRadius: 12, padding: 14, background: '#211d2d', color: 'white', border: '1px solid #5d4d7e', font: 'inherit' }} />
        <button type="submit" disabled={loading || message.trim().length < 3}
          style={{ padding: '14px 20px', borderRadius: 12, background: '#8d5cf6', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: loading ? .6 : 1 }}>
          {loading ? 'Buscando opções...' : 'Encontrar lugares'}
        </button>
      </form>
      {result && <section aria-live="polite" style={{ marginTop: 32 }}>
        <p>{result.error || result.aiReply || result.message}</p>
        {result.clarification && <p style={{ color: '#c7b6ff' }}>{result.clarification}</p>}
        {result.notices?.map((notice) => <p key={notice} style={{ color: '#e8c887', fontSize: 14 }}>{notice}</p>)}
        <div style={{ display: 'grid', gap: 14 }}>
          {result.suggestions?.map((place) => <article key={place.id} style={{ padding: 20, border: '1px solid #514365', borderRadius: 16, background: '#1c1827' }}>
            <h2 style={{ marginTop: 0 }}>{place.name}</h2>
            <p style={{ color: '#c7b6ff' }}>{place.type} · {place.region}{place.price ? ' · ' + place.price : ''}</p>
            <p style={{ lineHeight: 1.5 }}>{place.description}</p>
            <small style={{ color: '#bcb3c9' }}>{place.reasons.join(' · ')}</small>
          </article>)}
        </div>
        {result.disclaimer && <p style={{ color: '#aaa3b5', fontSize: 13, marginTop: 20 }}>{result.disclaimer}</p>}
      </section>}
    </main>
  );
}
