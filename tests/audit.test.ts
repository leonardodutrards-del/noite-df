import { beforeEach, describe, expect, it } from 'vitest';
import { authService } from '@/modules/auth/service';
import { seedAuthTestUsers, TEST_USERS } from './auth-fixtures';
import { establishmentService } from '@/modules/establishments/service';
import { paymentAdminService } from '@/modules/payments/service';
import { establishmentRepository } from '@/infrastructure/repositories/in-memory-establishment-repository';

describe('Auditoria e Rastreabilidade de Ações', () => {
  beforeEach(() => {
    seedAuthTestUsers();
    establishmentRepository.reset();
    paymentAdminService.resetToDefaults();
  });

  it('registra trilha de auditoria completa na criação de conta, login e logout', async () => {
    const signup = await authService.signUp({
      name: 'Proprietário Novo',
      email: 'proprietario@novobar.com.br',
      password: 'Senha@123456',
      establishmentName: 'Novo Bar Brasília',
    });

    let logs = await authService.getAuditLogs();
    const signupLog = logs.find((l) => l.action === 'create_account' && l.actorId === signup.user.id);
    expect(signupLog).toBeDefined();
    expect(signupLog?.entityType).toBe('profile');
    expect(signupLog?.details?.establishmentName).toBe('Novo Bar Brasília');

    // Login
    const login = await authService.login({
      email: 'proprietario@novobar.com.br',
      password: 'Senha@123456',
    });
    logs = await authService.getAuditLogs();
    const loginLog = logs.find((l) => l.action === 'login' && l.actorId === login.user.id);
    expect(loginLog).toBeDefined();

    // Logout
    await authService.logout(login.token);
    logs = await authService.getAuditLogs();
    const logoutLog = logs.find((l) => l.action === 'logout' && l.actorId === login.user.id);
    expect(logoutLog).toBeDefined();
  });

  it('registra before_data e after_data em alterações de estabelecimentos', async () => {
    const { user: partner } = await authService.login({
      email: TEST_USERS.five.email,
      password: TEST_USERS.five.password,
    });

    const beforePlace = await establishmentRepository.findById('five-sport-bar');
    expect(beforePlace).not.toBeNull();

    await establishmentService.update(
      'five-sport-bar',
      { description: 'Nova descrição com transmissão de todos os campeonatos.' },
      partner
    );

    const logs = await authService.getAuditLogs();
    const updateLog = logs.find(
      (l) => l.action === 'update_establishment' && l.entityId === 'five-sport-bar'
    );

    expect(updateLog).toBeDefined();
    expect(updateLog?.actorEmail).toBe(TEST_USERS.five.email);
    expect(updateLog?.actorRole).toBe('partner');
    expect((updateLog?.beforeData as { description?: string })?.description).toBe(beforePlace?.description);
    expect((updateLog?.afterData as { description?: string })?.description).toBe(
      'Nova descrição com transmissão de todos os campeonatos.'
    );
  });

  it('registra suspensão administrativa com justificativa', async () => {
    const { user: master } = await authService.login({
      email: TEST_USERS.admin.email,
      password: TEST_USERS.admin.password,
    });

    await establishmentService.blockEstablishment('pinella', master, 'Denúncia de horário irregular');

    const logs = await authService.getAuditLogs();
    const blockLog = logs.find((l) => l.action === 'block_establishment' && l.entityId === 'pinella');

    expect(blockLog).toBeDefined();
    expect(blockLog?.actorEmail).toBe(TEST_USERS.admin.email);
    expect(blockLog?.details?.reason).toBe('Denúncia de horário irregular');
    expect((blockLog?.afterData as { publicationStatus?: string })?.publicationStatus).toBe('suspended');
  });
});
