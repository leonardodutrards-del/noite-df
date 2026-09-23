import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const analyticsLib = readFileSync(resolve(process.cwd(), 'lib/analytics.ts'), 'utf8');
const trackRoute = readFileSync(resolve(process.cwd(), 'app/api/analytics/track/route.ts'), 'utf8');
const partnerAnalytics = readFileSync(resolve(process.cwd(), 'modules/analytics/service.ts'), 'utf8');
const partnerPage = readFileSync(resolve(process.cwd(), 'app/parceiro/page.tsx'), 'utf8');
const placeContact = readFileSync(resolve(process.cwd(), 'components/PlaceContact.tsx'), 'utf8');

describe('Fase 6 — analytics reais', () => {
  it('associa interações ao estabelecimento', () => {
    expect(analyticsLib).toContain('establishmentId');
    expect(analyticsLib).toContain('properties.placeId');
    expect(trackRoute).toContain('establishment_id: establishmentId');
  });

  it('agrega métricas reais do período no servidor', () => {
    expect(partnerAnalytics).toContain("row.action === 'view'");
    expect(partnerAnalytics).toContain("row.action === 'whatsapp_click'");
    expect(partnerAnalytics).toContain('conversionRate');
    expect(partnerAnalytics).toContain('created_at');
  });

  it('remove métricas hardcoded do painel do parceiro', () => {
    expect(partnerPage).not.toContain("['Visualizações', '14.280']");
    expect(partnerPage).toContain('/api/parceiro/analytics?days=30');
    expect(partnerPage).toContain('analytics.views');
  });

  it('rastreia clique real no WhatsApp', () => {
    expect(placeContact).toContain("track('whatsapp_click'");
  });
});
