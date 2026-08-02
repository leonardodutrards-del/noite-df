import { RatingBreakdown as RatingBreakdownType } from '@/data/places';

const labels: Array<[keyof RatingBreakdownType, string]> = [
  ['food', 'Comida'],
  ['drinks', 'Bebidas'],
  ['service', 'Atendimento'],
  ['music', 'Música'],
  ['atmosphere', 'Ambiente'],
  ['priceBenefit', 'Custo-benefício'],
  ['safety', 'Segurança'],
  ['structure', 'Estrutura'],
  ['crowd', 'Público']
];

export function RatingBreakdown({ rating }: { rating: RatingBreakdownType }) {
  return (
    <div className="ratings-box">
      <div className="ratings-head">
        <strong>Nota Noite DF</strong>
        <span>⭐ {rating.overall.toFixed(1)} · {rating.reviewCount} avaliações</span>
      </div>
      <div className="ratings-grid">
        {labels.map(([key, label]) => {
          const value = Number(rating[key]);
          return (
            <div className="rating-row" key={key}>
              <span>{label}</span>
              <div className="rating-track"><div style={{ width: `${(value / 5) * 100}%` }} /></div>
              <b>{value.toFixed(1)}</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}
