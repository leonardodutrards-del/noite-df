import type { Establishment } from '@/modules/establishments/types';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const stopWords = new Set(['quero','para','com','uma','umas','uns','onde','hoje','amanha','lugar','lugares','no','na','em','de','do','da','um','o','a','e','que','me','indique','recomende','ate','por','favor','sair','ir','estou','procurando','gostaria','preciso','algo','tipo','tem','algum','alguma','boa','bom','perto','opcao','opcoes','mais','menos','pra','num','numa','aqui','brasilia','df']);
const aliases: Record<string, string[]> = {
  'sertanejo': ['sertanejo','sertaneja','modao','universitario'],
  'pagode': ['pagode','samba'],
  'eletronica': ['eletronica','eletronico','dj','techno','house'],
  'rock': ['rock','rocker','banda'],
  'bar': ['bar','pub','gastrobar','boteco','cervejaria'],
  'restaurante': ['restaurante','gastronomia','jantar','almoco','comida'],
  'boate': ['boate','balada','nightclub','danceteria'],
  'romantico': ['romantico','casal','encontro','date','intimista'],
  'tranquilo': ['tranquilo','calmo','sossegado','reservado'],
  'animado': ['animado','agitado','dancar','festa'],
};
const canonical = (term: string) => Object.entries(aliases).find(([, values]) => values.includes(term))?.[0] ?? term;
const tokenize = (value: string) => normalize(value).split(/[^a-z0-9]+/).filter(Boolean);
const includesTerm = (text: string, term: string) => {
  const words = tokenize(text);
  return words.some((word) => canonical(word) === canonical(term) || (term.length >= 5 && word.startsWith(term)));
};

export type ConciergeSuggestion = {
  id: string;
  name: string;
  region: string;
  type: string;
  description: string;
  price?: Establishment['price'];
  score: number;
  reasons: string[];
  mapsQuery?: string;
  rating?: number;
};
export type ConciergeAnalysis = { keywords: string[]; budgetMentioned: boolean; timeMentioned: boolean; needsClarification?: string };

export function analyzeConciergeQuery(query: string): ConciergeAnalysis {
  const normalized = normalize(query);
  const keywords = [...new Set(tokenize(query).filter((word) => word.length > 2 && !stopWords.has(word)).map(canonical))].slice(0, 16);
  const budgetMentioned = /(?:r\$|reais|orcamento|gastar|barato|economico|caro|preco)/.test(normalized);
  const timeMentioned = /\b(hoje|amanha|agora|aberto|aberta|horario|sabado|domingo|sexta|noite)\b/.test(normalized);
  return { keywords, budgetMentioned, timeMentioned, needsClarification: keywords.length === 0 ? 'Conte um bairro, estilo musical ou tipo de lugar para eu encontrar opções.' : undefined };
}

export function recommendEstablishments(query: string, establishments: Establishment[], limit = 5): ConciergeSuggestion[] {
  const { keywords } = analyzeConciergeQuery(query);
  if (!keywords.length) return [];
  return establishments
    .filter((place) => place.publicationStatus === 'published')
    .map((place) => {
      let score = 0;
      const reasons: string[] = [];
      for (const term of keywords) {
        if (includesTerm(place.name, term)) { score += 7; reasons.push('Nome relacionado à busca'); }
        if (includesTerm(place.region, term)) { score += 6; reasons.push('Região desejada'); }
        if (includesTerm(place.type, term)) { score += 5; reasons.push('Tipo de estabelecimento'); }
        if (place.music.some((item) => includesTerm(item, term))) { score += 6; reasons.push('Estilo musical compatível'); }
        if (place.vibe.some((item) => includesTerm(item, term))) { score += 5; reasons.push('Ambiente compatível'); }
        if (place.audience.some((item) => includesTerm(item, term))) { score += 3; reasons.push('Perfil de público compatível'); }
        if (includesTerm(place.description, term)) { score += 1; reasons.push('Descrição relacionada'); }
      }
      return { id: place.id, name: place.name, region: place.region, type: place.type, description: place.description, price: place.price, score, reasons: [...new Set(reasons)], mapsQuery: place.mapsQuery, rating: place.rating };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, Math.max(1, Math.min(limit, 10)));
}
