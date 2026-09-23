import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { validateMercadoPagoSignature } from '@/lib/mercado-pago';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Fase 7 — Mercado Pago', () => {
  it('valida x-signature com HMAC-SHA256 e comparação constante', () => {
    const secret = 'segredo-de-teste';
    const dataId = 'ABC123';
    const requestId = 'request-123';
    const ts = '1742505638683';
    const manifest = `id:abc123;request-id:${requestId};ts:${ts};`;
    const signature = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

    expect(
      validateMercadoPagoSignature({
        xSignature: `ts=${ts},v1=${signature}`,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(true);

    expect(
      validateMercadoPagoSignature({
        xSignature: `ts=${ts},v1=${'0'.repeat(64)}`,
        xRequestId: requestId,
        dataId,
        secret,
      })
    ).toBe(false);
  });

  it('processa webhook com idempotência e consulta ao recurso oficial', () => {
    const webhook = readFileSync(resolve(process.cwd(), 'app/api/payments/webhook/route.ts'), 'utf8');
    expect(webhook).toContain('validateMercadoPagoSignature');
    expect(webhook).toContain('webhookEventAlreadyProcessed');
    expect(webhook).toContain('fetchAndSyncMercadoPagoResource');
  });

  it('vincula assinatura ao parceiro autenticado', () => {
    const route = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
    expect(route).toContain('requireAuth(request)');
    expect(route).toContain('user.establishmentId');
    expect(route).toContain('externalReference');
  });

  it('reembolso de produção chama a API antes de persistir refunded', () => {
    const service = readFileSync(resolve(process.cwd(), 'modules/payments/service.ts'), 'utf8');
    expect(service).toContain('await mercadoPagoRefund');
    expect(service).toContain('providerPaymentId');
    expect(service.indexOf('await mercadoPagoRefund')).toBeLessThan(
      service.indexOf("status: 'refunded'", service.indexOf('await mercadoPagoRefund'))
    );
  });
});
