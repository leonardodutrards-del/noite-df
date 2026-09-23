import type { Establishment } from '@/modules/establishments/types';

export type CompletenessResult = {
  score: number;
  completed: number;
  total: number;
  missing: string[];
};

function text(value: unknown, min = 1) {
  return typeof value === 'string' && value.trim().length >= min;
}

export function calculateEstablishmentCompleteness(place: Establishment): CompletenessResult {
  const checks: Array<[string, boolean]> = [
    ['descrição', text(place.description, 40)],
    ['endereço', text(place.address, 8)],
    ['contato', Boolean(place.businessContact?.phone || place.businessContact?.whatsapp || place.whatsapp)],
    ['horários', Boolean(place.operatingHours?.text)],
    ['agenda', Boolean(place.agendaUrl || place.weeklySchedule.length > 0)],
    ['cardápio', Boolean(place.menu?.url)],
    ['faixa de preço', Boolean(place.price)],
    ['Instagram', text(place.instagram)],
    ['vibe', place.vibe.length > 0],
    ['música', place.music.length > 0],
    ['público', place.audience.length > 0],
    ['fonte/verificação', Boolean(place.source?.url || place.lastUpdated)],
  ];

  const completed = checks.filter(([, ok]) => ok).length;
  return {
    score: Math.round((completed / checks.length) * 100),
    completed,
    total: checks.length,
    missing: checks.filter(([, ok]) => !ok).map(([label]) => label),
  };
}
