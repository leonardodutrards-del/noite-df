import type { Establishment } from '@/modules/establishments/types';
import type { EventItem } from '@/modules/events/types';
import { buildPublicRatingSummary } from '@/lib/public-ratings';

// Editorial recommendations only: paid placements require a separate, disclosed policy.
export function getWeekendRecommendations(places: Establishment[], weekendEvents: EventItem[], limit = 8) {
  const counts = new Map<string, number>();
  for (const event of weekendEvents) counts.set(event.place, (counts.get(event.place) ?? 0) + 1);

  return places.filter(place => counts.has(place.name))
    .sort((a, b) => {
      const eventsDifference = (counts.get(b.name) ?? 0) - (counts.get(a.name) ?? 0);
      if (eventsDifference) return eventsDifference;
      const rating = (place: Establishment) => buildPublicRatingSummary(place.publicRatings ?? []).average;
      const aRating = rating(a);
      const bRating = rating(b);
      if (aRating !== undefined && bRating !== undefined && aRating !== bRating) return bRating - aRating;
      if (aRating !== undefined && bRating === undefined) return -1;
      if (bRating !== undefined && aRating === undefined) return 1;
      return a.name.localeCompare(b.name, 'pt-BR');
    }).slice(0, limit);
}
