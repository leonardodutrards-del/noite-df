import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const billingRoute = readFileSync(resolve(process.cwd(), 'app/api/parceiro/billing/route.ts'), 'utf8');
const billingCard = readFileSync(resolve(process.cwd(), 'components/PartnerBillingCard.tsx'), 'utf8');
const plans = readFileSync(resolve(process.cwd(), 'lib/plans.ts'), 'utf8');

describe('billing pix reconcile', () => {
  it('reconciles pending pix against Mercado Pago', () => {
    expect(billingRoute).toContain('reconcilePendingPix');
    expect(billingRoute).toContain('/v1/payments/');
    expect(billingRoute).toContain('syncPaymentResource(payment)');
  });
  it('renders pix billing separately', () => {
    expect(billingRoute).toContain('pix_30_days');
    expect(billingCard).toContain('Pagamento via Pix');
    expect(billingCard).toContain('Acesso liberado ate');
  });
  it('describes paid plan benefits', () => {
    expect(plans).toContain('Publicar agenda e programacao semanal');
    expect(plans).toContain('Analytics detalhado e taxa de conversao');
    expect(plans).toContain('Configuracao assistida do perfil e recursos');
  });
});
