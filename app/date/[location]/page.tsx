import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/PlaceCard';
import { getPlacesByIntent, MIN_CONTENT_COUNT_FOR_SEO } from '@/lib/curated-routes';

interface IntentPageProps {
  params: Promise<{ location: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateStaticParams() {
  return [{ location: 'brasilia' }];
}

export async function generateMetadata({ params }: IntentPageProps): Promise<Metadata> {
  const { location } = await params;
  if (location !== 'brasilia') {
    return { title: 'Página não encontrada | Noite DF', robots: { index: false, follow: false } };
  }

  const places = getPlacesByIntent('date', location);
  const isIndexable = places.length >= MIN_CONTENT_COUNT_FOR_SEO;
  const canonicalUrl = `${appUrl}/date/${location}`;

  return {
    title: 'Lugares para Date e Encontros em Brasília e DF | Noite DF',
    description: `Gastrobares, wine bars e restaurantes intimistas para casal em Brasília. Curadoria com informações reais e checadas.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: 'Lugares para Date em Brasília | Noite DF',
      description: 'Guia de restaurantes e bares intimistas para date em Brasília.',
      url: canonicalUrl,
      type: 'website',
      siteName: 'Noite DF',
    },
    robots: { index: isIndexable, follow: true },
  };
}

export default async function DateIntentPage({ params }: IntentPageProps) {
  const { location } = await params;
  if (location !== 'brasilia') {
    notFound();
  }

  const places = getPlacesByIntent('date', location);

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
        <span>Roteiros</span>
        {' › '}
        <span style={{ color: 'var(--text)' }}>Date em Brasília</span>
      </div>

      <section style={{ margin: '20px 0 30px' }}>
        <span className="badge">🍷 Date & Encontros</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0' }}>Lugares para Date em Brasília</h1>
        <p style={{ maxWidth: '700px', fontSize: '16px' }}>
          Seleção de {places.length} locais intimistas, wine bars e gastrobares ideais para encontros e jantares a dois no DF.
        </p>
      </section>

      {places.length > 0 ? (
        <div className="grid">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>Nenhum local para date confirmado no momento.</h3>
        </div>
      )}

      <footer className="footer">
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Voltar para a página principal do Noite DF</Link>
      </footer>
    </main>
  );
}
