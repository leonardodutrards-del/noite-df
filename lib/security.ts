const HTML_TAG_REGEX = /<[^>]*>/g;
const MAX_COMMENT_LENGTH = 1500;

export function sanitizeTextInput(input: string): string {
  return input.replace(HTML_TAG_REGEX, '').trim();
}

export function validateRating(value: number): boolean {
  return Number.isFinite(value) && value >= 1 && value <= 5;
}

export function validateComment(text: string): boolean {
  return typeof text === 'string' && text.trim().length > 0 && text.trim().length <= MAX_COMMENT_LENGTH;
}

export function isSafeExternalUrl(value: string): boolean {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value, 'https://example.com');
    return ['https:', 'http:'].includes(url.protocol) && !['javascript:', 'data:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function buildSecurityHeaders() {
  return {
    'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.mercadopago.com https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; object-src 'none';",
    'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'x-xss-protection': '0',
    'referrer-policy': 'strict-origin-when-cross-origin',
  } satisfies Record<string, string>;
}
