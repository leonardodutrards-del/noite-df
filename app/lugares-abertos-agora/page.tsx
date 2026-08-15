import type { Metadata } from 'next';
import Link from 'next/link';
import { places } from '@/data/places';
import { PlaceCard } from '@/components/PlaceCard';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Lugares Abertos Agora no DF | Noite DF',
  description: 'Consulte horários e funcionamento confirmado diretamente com os estabelecimentos do DF.',
  alternates: { canonical: `${appUrl}/lugares-abertos-agora` },
  robots: { index: false, follow: true },
};

export default function LugaresAbertosAgoraPage() {
  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/#radar">Radar</Link>
          <Link href="/#lugares">Lugares</Link>
          <Link href="/#ranking">Ranking</Link>
          <Link href="/#agenda">Agenda</Link>
          <Link href="/planos">Para estabelecimentos</Link>
        </nav>
      </header>

      <div style={{ margin: '20px 0 10px', fontSize: '13px', color: 'var(--muted)' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Início</Link>
        {' › '}
        <span style={{ color: 'var(--text)' }}>Lugares Abertos Agora</span>
      </div>

      <section style={{ margin: '20px 0 30px' }}>
        <span className="badge">Status em tempo real</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0' }}>Funcionamento em Tempo Real</h1>
        <p style={{ maxWidth: '750px', fontSize: '16px' }}>
          O Noite DF prioriza dados honestos: não simulamos status fictício de portas abertas.
          Confira abaixo os locais verificados e use os links oficiais de rota no Google Maps e Instagram para confirmação imediata.
        </p>
      </section>

      <div className="grid">
        {places.slice(0, 12).map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>

      <footer className="footer">
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Voltar para a página principal do Noite DF</Link>
      </footer>
    </main>
  );
}
