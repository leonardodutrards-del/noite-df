import type { PublicRatingSource, PublicRatingSummary } from '@/modules/establishments/types';

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export function validatePublicRatingSource(source: PublicRatingSource) {
  const issues: string[] = [];

  if (source.rating !== undefined && (source.rating < 0 || source.rating > 5)) {
    issues.push('nota fora do intervalo permitido');
  }

  if (source.reviewCount !== undefined && source.reviewCount < 0) {
    issues.push('quantidade negativa');
  }

  if (!isValidUrl(source.url)) {
    issues.push('url inválida');
  }

  if (!source.collectedAt) {
    issues.push('fonte sem data de coleta');
  }

  return issues;
}

export function buildPublicRatingSummary(sources: PublicRatingSource[]): PublicRatingSummary {
  const confirmedSources = sources.filter((source) => source.status === 'confirmed');
  const weighted = confirmedSources.filter((source) => source.rating !== undefined && source.reviewCount !== undefined && source.reviewCount > 0);

  const totalReviews = weighted.reduce((sum, source) => sum + (source.reviewCount ?? 0), 0);
  const weightedAverage = totalReviews > 0
    ? weighted.reduce((sum, source) => sum + ((source.rating ?? 0) * (source.reviewCount ?? 0)), 0) / totalReviews
    : undefined;

  return {
    average: weightedAverage,
    totalReviews: totalReviews > 0 ? totalReviews : undefined,
    sourceCount: confirmedSources.length,
    calculatedAt: new Date().toISOString(),
  };
}

export function getPublicRatingsDisplay(sources: PublicRatingSource[]) {
  const confirmedSources = sources.filter((source) => source.status === 'confirmed');
  const hasConfirmed = confirmedSources.length > 0;
  const summary = buildPublicRatingSummary(sources);

  if (!hasConfirmed) {
    return {
      headline: 'Avaliação pública ainda não localizada',
      summary,
      sources: [],
    };
  }

  return {
    headline: `${summary.average?.toFixed(1) ?? '—'} · ${summary.totalReviews ?? '—'} avaliações · ${confirmedSources.length} fonte${confirmedSources.length > 1 ? 's' : ''}`,
    summary,
    sources: confirmedSources.map((source) => ({
      label: source.label,
      url: source.url,
      rating: source.rating,
      reviewCount: source.reviewCount,
      collectedAt: source.collectedAt,
    })),
  };
}
