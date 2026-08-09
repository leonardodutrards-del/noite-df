import { describe, expect, it } from 'vitest';
import {
  buildSecurityHeaders,
  isSafeExternalUrl,
  sanitizeTextInput,
  validateComment,
  validateRating,
} from '@/lib/security';

describe('security helpers', () => {
  it('remove html e scripts de entradas textuais', () => {
    const input = 'Olá <script>alert(1)</script> <b>mundo</b>';
    const result = sanitizeTextInput(input);

    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<b>');
    expect(result).toContain('Olá');
    expect(result).toContain('mundo');
  });

  it('rejeita avaliações fora do intervalo permitido', () => {
    expect(validateRating(0)).toBe(false);
    expect(validateRating(6)).toBe(false);
    expect(validateRating(4)).toBe(true);
  });

  it('rejeita comentários acima do limite', () => {
    const longComment = 'a'.repeat(1501);
    expect(validateComment(longComment)).toBe(false);
    expect(validateComment('Comentário curto e seguro')).toBe(true);
  });

  it('bloqueia URLs maliciosas', () => {
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('data:text/html,hi')).toBe(false);
    expect(isSafeExternalUrl('https://instagram.com/noitedf')).toBe(true);
  });

  it('inclui cabeçalhos de segurança esperados', () => {
    const headers = buildSecurityHeaders();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});
