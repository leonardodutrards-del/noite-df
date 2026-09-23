import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const service = readFileSync(resolve(process.cwd(), 'modules/partnerships/service.ts'), 'utf8');
const claimRoute = readFileSync(resolve(process.cwd(), 'app/api/parceiro/claim-establishment/route.ts'), 'utf8');
const reviewRoute = readFileSync(resolve(process.cwd(), 'app/api/admin/claims/[id]/review/route.ts'), 'utf8');

describe('Fase 5 — reivindicação e aprovação de parceiros', () => {
  it('cria solicitação pendente em vez de promover automaticamente', () => {
    expect(claimRoute).toContain('partnershipService.createClaim');
    expect(claimRoute).toContain('status: 202');
    expect(claimRoute).not.toContain('convertToPartner');
  });

  it('bloqueia solicitações duplicadas pendentes', () => {
    expect(service).toContain('CLAIM_ALREADY_PENDING');
    expect(service).toContain('status=eq.pending');
  });

  it('somente aprovação administrativa promove perfil e marca owner_managed', () => {
    expect(reviewRoute).toContain('requireMasterAdmin');
    expect(service).toContain("role: 'partner'");
    expect(service).toContain('owner_managed: true');
    expect(service).toContain("decision === 'approved'");
  });

  it('registra a decisão na auditoria', () => {
    expect(service).toContain('partner_claim_');
    expect(service).toContain("entityType: 'partner_claim'");
  });
});
