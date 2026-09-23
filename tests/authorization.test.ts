import { beforeEach, describe, expect, it } from 'vitest';
import { authService } from '@/modules/auth/service';
import { seedAuthTestUsers, TEST_USERS } from './auth-fixtures';
import { establishmentService } from '@/modules/establishments/service';
import { paymentAdminService } from '@/modules/payments/service';
import { establishmentRepository } from '@/infrastructure/repositories/in-memory-establishment-repository';
import type { AuthUser } from '@/modules/auth/types';

describe('Autorização e Isolamento de Estabelecimentos', () => {
  let masterAdmin: AuthUser;
  let partnerFive: AuthUser;
  let partnerPinella: AuthUser;

  beforeEach(async () => {
    seedAuthTestUsers();
    establishmentRepository.reset();
    paymentAdminService.resetToDefaults();

    const masterRes = await authService.login({ email: TEST_USERS.admin.email, password: TEST_USERS.admin.password });
    masterAdmin = masterRes.user;

    const fiveRes = await authService.login({ email: TEST_USERS.five.email, password: TEST_USERS.five.password });
    partnerFive = fiveRes.user;

    const pinellaRes = await authService.login({ email: TEST_USERS.pinella.email, password: TEST_USERS.pinella.password });
    partnerPinella = pinellaRes.user;
  });

  it('partner visualiza e edita com sucesso o seu próprio estabelecimento', async () => {
    // Leitura autorizada
    const est = await establishmentService.getById('five-sport-bar', partnerFive);
    expect(est).not.toBeNull();
    expect(est?.id).toBe('five-sport-bar');

    // Edição autorizada
    const updated = await establishmentService.updateCrowdStatus('five-sport-bar', 'lotado', partnerFive);
    expect(updated.crowdStatus).toBe('lotado');

    const updatedSchedule = await establishmentService.updateSchedule(
      'five-sport-bar',
      [{ day: 'Sábado', title: 'Transmissão do UFC', time: '21h', details: 'Entrada franca' }],
      partnerFive
    );
    expect(updatedSchedule.weeklySchedule).toHaveLength(1);
    expect(updatedSchedule.weeklySchedule[0].title).toBe('Transmissão do UFC');
  });

  it('partner é bloqueado ao tentar visualizar dados privados de outro estabelecimento', async () => {
    // partnerFive tentando acessar pinella
    await expect(
      establishmentService.getById('pinella', partnerFive)
    ).rejects.toThrow('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');

    // partnerPinella tentando acessar five-sport-bar
    await expect(
      establishmentService.getById('five-sport-bar', partnerPinella)
    ).rejects.toThrow('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');
  });

  it('partner é bloqueado com 403/Forbidden ao tentar alterar perfil de outro estabelecimento', async () => {
    // partnerFive tentando alterar pinella
    await expect(
      establishmentService.update('pinella', { description: 'Tentativa indevida de invasão' }, partnerFive)
    ).rejects.toThrow('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');

    await expect(
      establishmentService.updateCrowdStatus('pinella', 'tranquilo', partnerFive)
    ).rejects.toThrow('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');

    // partnerPinella tentando alterar five-sport-bar
    await expect(
      establishmentService.update('five-sport-bar', { description: 'Tentativa indevida' }, partnerPinella)
    ).rejects.toThrow('FORBIDDEN_ESTABLISHMENT_ACCESS_DENIED');
  });

  it('partner não pode acessar operações exclusivas de admin', async () => {
    // Tentar listar todos os estabelecimentos administrativos
    await expect(
      establishmentService.listAllForAdmin(partnerFive)
    ).rejects.toThrow('FORBIDDEN_ADMIN_REQUIRED');

    // Tentar suspender/bloquear um estabelecimento
    await expect(
      establishmentService.blockEstablishment('pinella', partnerFive)
    ).rejects.toThrow('FORBIDDEN_ADMIN_REQUIRED');

    // Tentar listar pagamentos
    await expect(
      paymentAdminService.listAll(partnerFive)
    ).rejects.toThrow('FORBIDDEN_ADMIN_REQUIRED');

    // Tentar emitir reembolso
    await expect(
      paymentAdminService.refund('sub_pinella_1', 'Fraude', partnerFive)
    ).rejects.toThrow('FORBIDDEN_ADMIN_REQUIRED');
  });

  it('admin possui acesso geral a todos os estabelecimentos, edições e bloqueios', async () => {
    // Master admin pode ler qualquer estabelecimento
    const five = await establishmentService.getById('five-sport-bar', masterAdmin);
    const pinella = await establishmentService.getById('pinella', masterAdmin);
    expect(five).not.toBeNull();
    expect(pinella).not.toBeNull();

    // Master admin pode listar todos
    const all = await establishmentService.listAllForAdmin(masterAdmin);
    expect(all.length).toBeGreaterThan(5);

    // Master admin pode editar qualquer estabelecimento
    const updated = await establishmentService.update(
      'pinella',
      { description: 'Descrição atualizada pelo administrador master.' },
      masterAdmin
    );
    expect(updated.description).toBe('Descrição atualizada pelo administrador master.');

    // Master admin pode suspender/bloquear
    const blocked = await establishmentService.blockEstablishment('five-sport-bar', masterAdmin, 'Irregularidade constatada');
    expect(blocked.publicationStatus).toBe('suspended');

    // Master admin pode reativar
    const unblocked = await establishmentService.unblockEstablishment('five-sport-bar', masterAdmin);
    expect(unblocked.publicationStatus).toBe('published');
  });

  it('admin visualiza pagamentos e executa reembolsos com auditoria', async () => {
    const payments = await paymentAdminService.listAll(masterAdmin);
    expect(payments.length).toBeGreaterThanOrEqual(3);

    const targetPayment = payments[0];
    const refunded = await paymentAdminService.refund(
      targetPayment.id,
      'Cliente solicitou cancelamento no período de garantia',
      masterAdmin
    );

    expect(refunded.status).toBe('refunded');
    expect(refunded.refundedAt).toBeDefined();
    expect(refunded.refundReason).toBe('Cliente solicitou cancelamento no período de garantia');

    // Auditoria gerada
    const auditLogs = await authService.getAuditLogs();
    const refundLog = auditLogs.find((l) => l.action === 'refund_payment');
    expect(refundLog).toBeDefined();
    expect(refundLog?.actorEmail).toBe(TEST_USERS.admin.email);
    expect(refundLog?.entityId).toBe(targetPayment.id);
  });
});
