import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { places } from '@/data/places';
import { events } from '@/data/events';
import { RatingBreakdown } from '@/components/RatingBreakdown';
import { PublicRatingsSummary } from '@/components/PublicRatingsSummary';
import {
  getConfirmedCrowdStatus,
  getConfirmedSchedules,
  hasConfirmedRating,
  hasRealValue,
  isConfirmedEvent,
} from '@/lib/data-quality';

interface PlacePageProps {
  params: Promise<{ slug: string }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function generateStaticParams() {
  return places.map((place) => ({
    slug: place.id,
  }));
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const place = places.find((p) => p.id === slug);

  if (!place) {
    return {
      title: 'Estabelecimento não encontrado | Noite DF',
      description: 'O estabelecimento procurado não foi localizado no acervo do Noite DF.',
      robots: { index: false, follow: false },
    };
  }

  const title = `${place.name} — ${place.type} em ${place.region}`;
  const description = `${place.description} Endereço: ${place.address}. Informações verificadas no Noite DF.`;
  const canonicalUrl = `${appUrl}/lugar/${place.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${place.name} | Noite DF`,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Noite DF',
      locale: 'pt_BR',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PlacePage({ params }: PlacePageProps) {
  const { slug } = await params;
  const place = places.find((p) => p.id === slug);

  if (!place) {
    notFound();
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapsQuery)}`;
  const instagramUrl = place.instagram?.trim();
  const confirmedCrowd = getConfirmedCrowdStatus(place.crowdStatus);
  const confirmedSchedule = getConfirmedSchedules(place.weeklySchedule);
  const isRatingConfirmed = hasConfirmedRating(place);

  const placeEvents = events.filter(
    (e) => isConfirmedEvent(e) && (e.place.toLowerCase().includes(place.name.toLowerCase()) || place.name.toLowerCase().includes(e.place.toLowerCase()))
  );

  const schemaType =
    place.type === 'Restaurante' ? 'Restaurant' :
    place.type === 'Gastrobar' || place.type === 'Bar' || place.type === 'Pub' ? 'BarOrPub' :
    'LocalBusiness';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: place.name,
    description: place.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: place.address,
      addressLocality: place.region,
      addressRegion: 'DF',
      addressCountry: 'BR',
    },
    url: `${appUrl}/lugar/${place.id}`,
    priceRange: place.price,
  };

  if (isRatingConfirmed && place.rating) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: place.rating,
      reviewCount: place.ratingBreakdown?.reviewCount ?? place.publicRatingSummary?.totalReviews ?? 1,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          <span>{place.region}</span>
          {' › '}
          <span style={{ color: 'var(--text)' }}>{place.name}</span>
        </div>

        <section className="panel" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
            <div>
              <span className="badge" style={{ marginBottom: '10px' }}>{place.region} · {place.type}</span>
              <h1 style={{ margin: '8px 0 12px', fontSize: 'clamp(28px, 4vw, 44px)' }}>{place.name}</h1>
              <p style={{ margin: '0 0 16px', fontSize: '16px', maxWidth: '750px' }}>{place.description}</p>
              <p style={{ margin: '0', fontSize: '14px', color: 'var(--muted)' }}>📍 {place.address}</p>
            </div>
            {isRatingConfirmed && place.rating !== undefined && (
              <div style={{ textAlign: 'right', background: 'var(--card-2)', padding: '14px 20px', borderRadius: '16px', minWidth: '120px' }}>
                <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent)' }}>⭐ {place.rating.toFixed(1)}</span>
                <small style={{ display: 'block', color: 'var(--muted)', marginTop: '4px' }}>Nota verificada</small>
              </div>
            )}
          </div>

          <div className="tags" style={{ marginTop: '20px' }}>
            {place.verified && <span className="tag verified">✔ verificado</span>}
            {place.ownerManaged && <span className="tag">gerenciado pelo local</span>}
            {confirmedCrowd && <span className="tag">lotação: {confirmedCrowd}</span>}
            {hasRealValue(place.price) && <span className="tag">Preço médio: {place.price}</span>}
            {place.vibe.filter((v) => hasRealValue(v)).map((v) => (
              <span className="tag" key={v}>vibe: {v}</span>
            ))}
            {place.music.filter((m) => hasRealValue(m)).map((m) => (
              <span className="tag" key={m}>música: {m}</span>
            ))}
            {place.audience.filter((a) => hasRealValue(a)).map((a) => (
              <span className="tag" key={a}>público: {a}</span>
            ))}
          </div>

          {place.currentPromotion && hasRealValue(place.currentPromotion.title) && (
            <div className="promo" style={{ marginTop: '20px' }}>
              <strong>{place.currentPromotion.title}</strong>
              <span>{place.currentPromotion.description}</span>
            </div>
          )}

          {place.ratingBreakdown && <RatingBreakdown rating={place.ratingBreakdown} />}
          {place.publicRatings && place.publicRatings.length > 0 && (
            <PublicRatingsSummary sources={place.publicRatings} />
          )}

          {confirmedSchedule.length > 0 && (
            <div style={{ margin: '24px 0', padding: '16px', background: 'var(--card-2)', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 12px' }}>Programação confirmada</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {confirmedSchedule.map((item) => (
                  <div key={`${item.day}-${item.title}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span><b>{item.day}:</b> {item.title}</span>
                    <span style={{ color: 'var(--muted)' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {placeEvents.length > 0 && (
            <div style={{ margin: '24px 0', padding: '16px', background: 'var(--card-2)', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 12px' }}>Eventos confirmados</h3>
              {placeEvents.map((evt) => (
                <div key={evt.id} style={{ marginBottom: '10px' }}>
                  <strong>{evt.title}</strong>
                  <p style={{ margin: '4px 0', fontSize: '13px' }}>{evt.description}</p>
                  <small style={{ color: 'var(--muted)' }}>{evt.dateLabel}</small>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '28px' }}>
            <a className="button" href={mapsUrl} target="_blank" rel="noreferrer">
              Abrir rota no Google Maps ↗
            </a>
            {instagramUrl && hasRealValue(instagramUrl) && (
              <a className="button ghost" href={instagramUrl} target="_blank" rel="noreferrer">
                Instagram Oficial ↗
              </a>
            )}
            <Link className="button ghost" href="/">
              Voltar ao Guia
            </Link>
          </div>

          <div style={{ marginTop: '28px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <small style={{ color: 'var(--muted)', fontSize: '12px', display: 'block' }}>
              {place.source?.label ? `Fonte cadastral: ${place.source.label}` : 'Curadoria editorial Noite DF'}
              {place.lastUpdated ? ` · Última verificação em ${place.lastUpdated}` : ''}
            </small>
          </div>
        </section>

        <footer className="footer">
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>← Voltar para a página principal do Noite DF</Link>
        </footer>
      </main>
    </>
  );
}
