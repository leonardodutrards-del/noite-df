import type { Establishment } from '@/modules/establishments/types';

export type NightIntent =
  | 'comer'
  | 'beber'
  | 'musica-ao-vivo'
  | 'dancar'
  | 'date'
  | 'barato'
  | 'evento-hoje';

export const intentOptions: Array<{ id: NightIntent; label: string; description: string }> = [
  { id: 'comer', label: '🍽️ Comer', description: 'Restaurantes, gastrobares e lugares com foco em gastronomia.' },
  { id: 'beber', label: '🍻 Beber', description: 'Bares, pubs, drinks, cerveja e happy hour.' },
  { id: 'musica-ao-vivo', label: '🎤 Música ao vivo', description: 'Casas e lugares associados a shows ou música ao vivo.' },
  { id: 'dancar', label: '💃 Dançar', description: 'Balada, pista, festas, funk e eletrônica.' },
  { id: 'date', label: '🍷 Date', description: 'Lugares com perfil para casal, vinho, jantar ou ambiente sofisticado.' },
  { id: 'barato', label: '💸 Rolê barato', description: 'Locais com faixa de preço $ ou perfil de baixo custo.' },
  { id: 'evento-hoje', label: '📅 Evento hoje', description: 'Estabelecimentos com evento oficial ainda válido hoje.' },
];

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function matchesNightIntent(
  place: Establishment,
  intent: NightIntent,
  todayEventPlaces: Set<string> = new Set()
): boolean {
  const tags = [
    place.type,
    place.description,
    ...place.vibe,
    ...place.music,
    ...place.audience,
  ].map(normalize);
  const includes = (...terms: string[]) =>
    terms.some((term) => tags.some((tag) => tag.includes(normalize(term))));

  switch (intent) {
    case 'comer':
      return place.type === 'Restaurante' ||
        place.type === 'Gastrobar' ||
        place.type === 'Complexo gastronômico' ||
        includes('gastronomia', 'jantar', 'comida', 'petisco');
    case 'beber':
      return place.type === 'Bar' ||
        place.type === 'Pub' ||
        place.type === 'Gastrobar' ||
        includes('drinks', 'cerveja', 'chope', 'chopp', 'happy hour', 'vinho');
    case 'musica-ao-vivo':
      return place.type === 'Casa de show' ||
        includes('musica ao vivo', 'shows', 'show', 'pagode', 'samba', 'rock');
    case 'dancar':
      return place.type === 'Boate' ||
        includes('balada', 'dancar', 'pista', 'funk', 'eletronica', 'festas');
    case 'date':
      return includes('date', 'casais', 'vinho', 'sofisticado', 'jantar', 'romantico');
    case 'barato':
      return place.price === '$' || includes('baixo custo', 'barato', 'popular');
    case 'evento-hoje':
      return todayEventPlaces.has(normalize(place.name));
  }
}
