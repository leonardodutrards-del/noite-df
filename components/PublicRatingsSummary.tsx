import { PublicRatingSource } from '@/modules/establishments/types';
import { getPublicRatingsDisplay } from '@/lib/public-ratings';

export function PublicRatingsSummary({ sources }: { sources: PublicRatingSource[] }) {
  const display = getPublicRatingsDisplay(sources);

  if (!display.sources.length) {
    return (
      <div className="ratings-box">
        <div className="ratings-head">
          <strong>Avaliação pública</strong>
          <span>{display.headline}</span>
        </div>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
          As avaliações pertencem às plataformas indicadas e podem mudar. O Noite DF não altera nem substitui as notas das fontes.
        </p>
      </div>
    );
  }

  return (
    <div className="ratings-box">
      <div className="ratings-head">
        <strong>Avaliação pública</strong>
        <span>{display.headline}</span>
      </div>
      <div className="ratings-grid">
        {display.sources.map((source) => (
          <div key={`${source.label}-${source.url}`} className="rating-row" style={{ gridTemplateColumns: '1fr auto auto' }}>
            <span>{source.label} · {source.reviewCount ?? '—'} avaliações · {source.collectedAt}</span>
            <b>{source.rating?.toFixed(1) ?? '—'}</b>
            <a href={source.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
              Ver avaliações
            </a>
          </div>
        ))}
      </div>
      <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
        As avaliações pertencem às plataformas indicadas e podem mudar. O Noite DF não altera nem substitui as notas das fontes.
      </p>
    </div>
  );
}
