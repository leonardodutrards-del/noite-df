import { describe, expect, it } from 'vitest';
import { validatePaymentUrl, isAllowedMercadoPagoHostname } from '@/lib/payment-links';

describe('payment links validation', () => {
  it('accepts valid mpago.la URLs', () => {
    expect(validatePaymentUrl('https://mpago.la/2mGa364')).toBe('https://mpago.la/2mGa364');
  });

  it('rejects non-HTTPS URLs', () => {
    expect(() => validatePaymentUrl('http://mpago.la/2mGa364')).toThrow('Link de pagamento deve usar HTTPS.');
  });

  it('rejects invalid hostnames', () => {
    expect(() => validatePaymentUrl('https://example.com/2mGa364')).toThrow('Hostname de pagamento inválido.');
  });

  it('allows mercadopago.com.br hosts', () => {
    expect(isAllowedMercadoPagoHostname('secure.mercadopago.com.br')).toBe(true);
  });
});
