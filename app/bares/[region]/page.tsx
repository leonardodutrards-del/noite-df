import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceCard } from '@/components/PlaceCard';
import {
  REGION_SLUG_MAP,
  getBarsByRegionSlug,
  getRegionFromSlug,
  MIN_CONTENT_COUNT_FOR_SEO,
} from '@/lib/curated-routes';

interface BaresPageProps {
  params: Promise<{ region: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateStaticParams() {
  return Object.keys(REGION_SLUG_MAP).map((region) => ({ region }));
}

export async function generateMetadata({ params }: BaresPageProps): Promise<Metadata> {
  const { region } = await params;
  const regionName = getRegionFromSlug(region);

  if (!regionName) {
    return {
      title: 'Região não encontrada | Noite DF',
      robots: { index: false, follow: false },
    };
  }

  const bars = getBarsByRegionSlug(region);
  const isIndexable = bars.length >= MIN_CONTENT_COUNT_FOR_SEO;
  const canonicalUrl = `${appUrl}/bares/${region}`;

  return {
    title: `Bares em ${regionName} — Guia de Botecos e Gastrobares | Noite DF`,
    description: `Descubra os melhores bares, botecos e pubs em ${regionName} no Distrito Federal. Dados conferidos e sem informações fictícias.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Bares em ${regionName} | Noite DF`,
      description: `Guia com ${bars.length} bares em ${regionName}.`,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Noite DF',
    },
    robots: { index: isIndexable, follow: true },
  };
}

export default async function BaresRegionPage({ params }: BaresPageProps) {
  const { region } = await params;
  const regionName = getRegionFromSlug(region);

  if (!regionName) {
    notFound();
  }

  const bars = getBarsByRegionSlug(region);

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
        <span>Bares</span>
        {' › '}
        <span style={{ color: 'var(--text)' }}>{regionName}</span>
      </div>

      <section style={{ margin: '20px 0 30px' }}>
        <span className="badge">Guia Temático</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0' }}>Bares em {regionName}</h1>
        <p style={{ maxWidth: '700px', fontSize: '16px' }}>
          Conheça {bars.length} bares, pubs e gastrobares em {regionName}. Endereços, vibes e links oficiais verificados.
        </p>
      </section>

      {bars.length > 0 ? (
        <div className="grid">
          {bars.map((bar) => (
            <PlaceCard key={bar.id} place={bar} />
          ))}
        </div>
      ) : (
        <div className="empty">
          <h3>Nenhum bar verificado nesta região no momento.</h3>
          <p>Nossa equipe está adicionando novos estabelecimentos checados.</p>
        </div>
      )}

      <footer className="footer">
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Voltar para a página principal do Noite DF</Link>
      </footer>
    </main>
  );
}
