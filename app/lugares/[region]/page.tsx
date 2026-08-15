import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/PlaceCard';
import {
  REGION_SLUG_MAP,
  getPlacesByRegionSlug,
  getRegionFromSlug,
  MIN_CONTENT_COUNT_FOR_SEO,
} from '@/lib/curated-routes';

interface RegionPageProps {
  params: Promise<{ region: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateStaticParams() {
  return Object.keys(REGION_SLUG_MAP).map((region) => ({ region }));
}

export async function generateMetadata({ params }: RegionPageProps): Promise<Metadata> {
  const { region } = await params;
  const regionName = getRegionFromSlug(region);

  if (!regionName) {
    return {
      title: 'Região não encontrada | Noite DF',
      robots: { index: false, follow: false },
    };
  }

  const places = getPlacesByRegionSlug(region);
  const isIndexable = places.length >= MIN_CONTENT_COUNT_FOR_SEO;
  const canonicalUrl = `${appUrl}/lugares/${region}`;

  return {
    title: `Lugares em ${regionName} — Guia de Bares e Restaurantes | Noite DF`,
    description: `Descubra ${places.length} lugares para sair em ${regionName}, no Distrito Federal. Bares, restaurantes e experiências locais verificadas.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Lugares em ${regionName} | Noite DF`,
      description: `Guia de estabelecimentos verificados em ${regionName}.`,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Noite DF',
    },
    robots: { index: isIndexable, follow: true },
  };
}

export default async function RegionLugaresPage({ params }: RegionPageProps) {
  const { region } = await params;
  const regionName = getRegionFromSlug(region);

  if (!regionName) {
    notFound();
  }

  const places = getPlacesByRegionSlug(region);

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
        <span>Regiões</span>
        {' › '}
        <span style={{ color: 'var(--text)' }}>{regionName}</span>
      </div>

      <section style={{ margin: '20px 0 30px' }}>
        <span className="badge">Guia Regional</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0' }}>Lugares em {regionName}</h1>
        <p style={{ maxWidth: '700px', fontSize: '16px' }}>
          Explore os {places.length} estabelecimentos cadastrados e verificados em {regionName}. Informações honestas e diretas ao ponto.
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
          <h3>Nenhum estabelecimento verificado nesta região no momento.</h3>
          <p>Nossa curadoria está expandindo os cadastros verificados do DF.</p>
        </div>
      )}

      <footer className="footer">
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Voltar para a página principal do Noite DF</Link>
      </footer>
    </main>
  );
}
