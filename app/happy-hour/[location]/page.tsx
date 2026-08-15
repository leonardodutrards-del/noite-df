import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/PlaceCard';
import { getPlacesByIntent, getRegionFromSlug, MIN_CONTENT_COUNT_FOR_SEO } from '@/lib/curated-routes';

interface IntentPageProps {
  params: Promise<{ location: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateStaticParams() {
  return [{ location: 'asa-sul' }, { location: 'brasilia' }];
}

export async function generateMetadata({ params }: IntentPageProps): Promise<Metadata> {
  const { location } = await params;
  const locationName = location === 'brasilia' ? 'Brasília' : getRegionFromSlug(location);

  if (!locationName) {
    return { title: 'Página não encontrada | Noite DF', robots: { index: false, follow: false } };
  }

  const places = getPlacesByIntent('happy-hour', location);
  const isIndexable = places.length >= MIN_CONTENT_COUNT_FOR_SEO;
  const canonicalUrl = `${appUrl}/happy-hour/${location}`;

  return {
    title: `Melhores Lugares para Happy Hour em ${locationName} | Noite DF`,
    description: `Bares, gastrobares e botecos ideais para happy hour em ${locationName}. Chope gelado, petiscos e encontros.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Happy Hour em ${locationName} | Noite DF`,
      description: `Guia de happy hour em ${locationName}.`,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Noite DF',
    },
    robots: { index: isIndexable, follow: true },
  };
}

export default async function HappyHourPage({ params }: IntentPageProps) {
  const { location } = await params;
  const locationName = location === 'brasilia' ? 'Brasília' : getRegionFromSlug(location);

  if (!locationName) {
    notFound();
  }

  const places = getPlacesByIntent('happy-hour', location);

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
        <span style={{ color: 'var(--text)' }}>Happy Hour em {locationName}</span>
      </div>

      <section style={{ margin: '20px 0 30px' }}>
        <span className="badge">🍻 Happy Hour</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0' }}>Happy Hour em {locationName}</h1>
        <p style={{ maxWidth: '700px', fontSize: '16px' }}>
          Confira {places.length} opções verificadas com ambiente descontraído, petiscos e chope para relaxar após o trabalho.
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
          <h3>Nenhum lugar de happy hour confirmado nesta região no momento.</h3>
        </div>
      )}

      <footer className="footer">
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Voltar para a página principal do Noite DF</Link>
      </footer>
    </main>
  );
}
