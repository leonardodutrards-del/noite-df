import type { Establishment } from '@/modules/establishments/types';

export type RadarFilter = 'bombando' | 'tranquilo' | 'shows' | 'sertanejo' | 'pagode' | 'date' | 'familia' | 'happy-hour';

export const radarOptions: { id: RadarFilter; label: string; description: string }[] = [
  { id: 'bombando', label: '🔥 Bombando', description: 'Lugares com perfil de festa e música. Não indica lotação em tempo real.' },
  { id: 'tranquilo', label: '🟢 Tranquilo', description: 'Lugares com perfil de jantar, conversa e passeio. Não indica lotação em tempo real.' },
  { id: 'shows', label: '🎤 Shows', description: 'Casas e espaços com perfil de shows. Confira a agenda antes de sair.' },
  { id: 'sertanejo', label: '🤠 Sertanejo', description: 'Lugares associados ao sertanejo.' },
  { id: 'pagode', label: '🥁 Pagode', description: 'Lugares associados ao pagode.' },
  { id: 'date', label: '🍷 Date', description: 'Lugares para um encontro.' },
  { id: 'familia', label: '👨‍👩‍👧 Família', description: 'Lugares com perfil familiar.' },
  { id: 'happy-hour', label: '🍻 Happy hour', description: 'Lugares associados ao happy hour.' },
];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function matchesRadar(place: Establishment, filter: RadarFilter): boolean {
  const tags = [...place.vibe, ...place.music, ...place.audience].map(normalize);
  const includes = (...terms: string[]) => terms.some(term => tags.some(tag => tag.includes(term)));

  switch (filter) {
    case 'bombando': return includes('balada', 'dancar', 'shows', 'festas', 'pagode', 'piseiro', 'musica ao vivo') || place.type === 'Boate';
    case 'tranquilo': return includes('date', 'jantar', 'lago', 'por do sol', 'familia', 'cafe', 'sossegado', 'tranquilo') && !includes('balada', 'dancar', 'festas');
    case 'shows': return includes('shows', 'musica ao vivo') || place.type === 'Casa de show';
    case 'sertanejo': return includes('sertanejo');
    case 'pagode': return includes('pagode');
    case 'date': return includes('date', 'casais', 'vinhos', 'romantico');
    case 'familia': return includes('familia', 'lazer');
    case 'happy-hour': return includes('happy hour');
  }
}
