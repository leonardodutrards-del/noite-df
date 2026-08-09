import type { PlanCode } from '@/lib/plans';

const ALLOWED_HOSTNAMES = new Set(['mpago.la']);

export function isAllowedMercadoPagoHostname(hostname: string): boolean {
  if (ALLOWED_HOSTNAMES.has(hostname)) return true;
  return hostname === 'mercadopago.com.br' || hostname.endsWith('.mercadopago.com.br');
}

export function validatePaymentUrl(value: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Link de pagamento não informado.');
  }
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('Link de pagamento inválido.');
  }
  if (url.protocol !== 'https:') {
    throw new Error('Link de pagamento deve usar HTTPS.');
  }
  if (!isAllowedMercadoPagoHostname(url.hostname)) {
    throw new Error('Hostname de pagamento inválido.');
  }
  return url.toString();
}

export function getPaymentLink(planId: PlanCode): string | undefined {
  const rawLink = planId === 'pro'
    ? process.env.MERCADO_PAGO_PRO_PAYMENT_LINK
    : planId === 'premium'
      ? process.env.MERCADO_PAGO_PREMIUM_PAYMENT_LINK
      : planId === 'enterprise'
        ? process.env.MERCADO_PAGO_ENTERPRISE_PAYMENT_LINK
        : undefined;

  if (!rawLink) return undefined;
  return validatePaymentUrl(rawLink);
}
