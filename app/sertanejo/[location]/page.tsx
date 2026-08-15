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

  const places = getPlacesByIntent('sertanejo', location);
  const isIndexable = places.length >= MIN_CONTENT_COUNT_FOR_SEO;
  const canonicalUrl = `${appUrl}/sertanejo/${location}`;

  return {
    title: 'Onde curtir Sertanejo e Piseiro em Brasília e DF | Noite DF',
    description: `Casas de show, ranchos e bares com música sertaneja, forró e piseiro em Brasília e regiões do DF.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: 'Sertanejo em Brasília | Noite DF',
      description: 'Guia de sertanejo e piseiro no DF.',
      url: canonicalUrl,
      type: 'website',
      siteName: 'Noite DF',
    },
    robots: { index: isIndexable, follow: true },
  };
}

export default async function SertanejoPage({ params }: IntentPageProps) {
  const { location } = await params;
  if (location !== 'brasilia') {
    notFound();
  }

  const places = getPlacesByIntent('sertanejo', location);

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
        <span>Estilos musicais</span>
        {' › '}
        <span style={{ color: 'var(--text)' }}>Sertanejo em Brasília</span>
      </div>

      <section style={{ margin: '20px 0 30px' }}>
        <span className="badge">🤠 Vibe Sertanejo & Piseiro</span>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', margin: '12px 0' }}>Sertanejo e Piseiro no DF</h1>
        <p style={{ maxWidth: '700px', fontSize: '16px' }}>
          Descubra {places.length} locais verificados com noites de sertanejo, dança, forró e atrações agro no Distrito Federal e Entorno.
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
          <h3>Nenhum lugar sertanejo confirmado no momento.</h3>
        </div>
      )}

      <footer className="footer">
        <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Voltar para a página principal do Noite DF</Link>
      </footer>
    </main>
  );
}
