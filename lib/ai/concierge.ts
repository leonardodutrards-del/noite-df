import type { Establishment } from '@/modules/establishments/types';

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const stopWords = new Set(['quero','para','com','uma','umas','uns','onde','hoje','amanha','lugar','lugares','no','na','em','de','do','da','um','o','a','e','que','me','indique','recomende','ate','por','favor','sair','ir']);

export type ConciergeSuggestion = {
  id: string;
  name: string;
  region: string;
  type: string;
  description: string;
  price?: Establishment['price'];
  score: number;
  reasons: string[];
};

export function recommendEstablishments(query: string, establishments: Establishment[], limit = 5): ConciergeSuggestion[] {
  const terms = [...new Set(normalize(query).split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !stopWords.has(word)))].slice(0, 16);
  if (terms.length === 0) return [];
  return establishments
    .filter((place) => place.publicationStatus === 'published')
    .map((place) => {
      const name = normalize(place.name);
      const region = normalize(place.region);
      const tags = normalize([place.type, ...place.vibe, ...place.music, ...place.audience].join(' '));
      const description = normalize(place.description);
      let score = 0;
      const reasons: string[] = [];
      for (const term of terms) {
        if (name.includes(term)) { score += 4; reasons.push('Nome relacionado ao pedido'); }
        if (region.includes(term)) { score += 3; reasons.push('Região compatível'); }
        if (tags.includes(term)) { score += 3; reasons.push('Perfil compatível'); }
        if (description.includes(term)) { score += 1; reasons.push('Descrição relacionada'); }
      }
      return { id: place.id, name: place.name, region: place.region, type: place.type, description: place.description, price: place.price, score, reasons: [...new Set(reasons)] };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, Math.max(1, Math.min(limit, 10)));
}
