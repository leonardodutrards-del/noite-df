import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { authService } from '@/modules/auth/service';
import { seedAuthTestUsers, TEST_USERS } from './auth-fixtures';
import { establishmentRepository } from '@/infrastructure/repositories/in-memory-establishment-repository';
import { paymentAdminService } from '@/modules/payments/service';
import { POST as loginRoute } from '@/app/api/auth/login/route';
import { POST as signupRoute } from '@/app/api/auth/signup/route';
import { POST as logoutRoute } from '@/app/api/auth/logout/route';
import { GET as meRoute } from '@/app/api/auth/me/route';
import { GET as getPartnerEstablishmentRoute, PATCH as patchPartnerEstablishmentRoute } from '@/app/api/parceiro/establishment/route';
import { GET as getEstablishmentByIdRoute, PATCH as patchEstablishmentByIdRoute } from '@/app/api/establishments/[id]/route';
import { GET as getAdminEstablishmentsRoute } from '@/app/api/admin/establishments/route';
import { POST as blockAdminEstablishmentRoute } from '@/app/api/admin/establishments/[id]/block/route';
import { GET as getAdminPaymentsRoute } from '@/app/api/admin/payments/route';
import { POST as refundAdminPaymentRoute } from '@/app/api/admin/payments/[id]/refund/route';
import { GET as getAdminAuditLogRoute } from '@/app/api/admin/audit-log/route';
import { SESSION_COOKIE_NAME } from '@/modules/auth/session';

function createJsonRequest(url: string, method: string, body?: unknown, token?: string): NextRequest {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Cookie'] = `${SESSION_COOKIE_NAME}=${token}`;
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API Route Handlers — Autenticação e Proteção no Servidor', () => {
  beforeEach(() => {
    seedAuthTestUsers();
    establishmentRepository.reset();
    paymentAdminService.resetToDefaults();
  });

  it('POST /api/auth/login retorna 200 e define cookie de sessão para login válido', async () => {
    const req = createJsonRequest('/api/auth/login', 'POST', {
      email: TEST_USERS.five.email,
      password: TEST_USERS.five.password,
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.email).toBe(TEST_USERS.five.email);

    // Cookie verificado
    const cookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie).toBeDefined();
    expect(cookie?.value.length).toBeGreaterThan(20);
  });

  it('POST /api/auth/login retorna 401 para credenciais incorretas', async () => {
    const req = createJsonRequest('/api/auth/login', 'POST', {
      email: TEST_USERS.five.email,
      password: 'SenhaErrada@000',
    });

    const res = await loginRoute(req);
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/signup cria novo parceiro e retorna 201 com cookie', async () => {
    const req = createJsonRequest('/api/auth/signup', 'POST', {
      name: 'Roberto Diniz',
      email: 'roberto@dinizbar.com.br',
      password: 'SenhaDiniz@2026',
      establishmentName: 'Diniz Pub',
    });

    const res = await signupRoute(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.role).toBe('partner');
    expect(data.user.establishmentId).toBe('diniz-pub');
  });

  it('GET /api/auth/me retorna dados do usuário logado ou 401 para não autenticado', async () => {
    // Não autenticado
    const unauthReq = createJsonRequest('/api/auth/me', 'GET');
    const unauthRes = await meRoute(unauthReq);
    expect(unauthRes.status).toBe(401);

    // Autenticado
    const { token } = await authService.login({ email: TEST_USERS.pinella.email, password: TEST_USERS.pinella.password });
    const authReq = createJsonRequest('/api/auth/me', 'GET', undefined, token);
    const authRes = await meRoute(authReq);
    expect(authRes.status).toBe(200);
    const data = await authRes.json();
    expect(data.user.email).toBe(TEST_USERS.pinella.email);
  });

  it('POST /api/auth/logout invalida sessão e limpa cookie', async () => {
    const { token } = await authService.login({ email: TEST_USERS.admin.email, password: TEST_USERS.admin.password });
    const req = createJsonRequest('/api/auth/logout', 'POST', undefined, token);
    const res = await logoutRoute(req);

    expect(res.status).toBe(200);
    const userAfter = await authService.validateSession(token);
    expect(userAfter).toBeNull();
  });

  it('GET e PATCH /api/parceiro/establishment protegem dados do estabelecimento associado', async () => {
    const { token } = await authService.login({ email: TEST_USERS.five.email, password: TEST_USERS.five.password });

    // Leitura autorizada
    const getReq = createJsonRequest('/api/parceiro/establishment', 'GET', undefined, token);
    const getRes = await getPartnerEstablishmentRoute(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.establishment.id).toBe('five-sport-bar');

    // Edição autorizada
    const patchReq = createJsonRequest(
      '/api/parceiro/establishment',
      'PATCH',
      { crowdStatus: 'movimentado', whatsapp: '(61) 98888-7777' },
      token
    );
    const patchRes = await patchPartnerEstablishmentRoute(patchReq);
    expect(patchRes.status).toBe(200);
    const patchData = await patchRes.json();
    expect(patchData.establishment.crowdStatus).toBe('movimentado');
    expect(patchData.establishment.whatsapp).toBe('(61) 98888-7777');
  });

  it('PATCH /api/parceiro/establishment retorna 403 se parceiro tentar modificar outro estabelecimento', async () => {
    const { token } = await authService.login({ email: TEST_USERS.five.email, password: TEST_USERS.five.password });

    const patchReq = createJsonRequest(
      '/api/parceiro/establishment',
      'PATCH',
      { establishmentId: 'pinella', crowdStatus: 'lotado' },
      token
    );
    const patchRes = await patchPartnerEstablishmentRoute(patchReq);
    expect(patchRes.status).toBe(403);
  });

  it('GET /api/establishments/[id] retorna dados públicos ou 404 para inexistente', async () => {
    const req = createJsonRequest('/api/establishments/five-sport-bar', 'GET');
    const res = await getEstablishmentByIdRoute(req, { params: Promise.resolve({ id: 'five-sport-bar' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.establishment.name).toBe('Five Sport Bar');
  });

  it('PATCH /api/establishments/[id] bloqueia com 403 tentativa de edição cruzada', async () => {
    const { token } = await authService.login({ email: TEST_USERS.five.email, password: TEST_USERS.five.password });

    const patchReq = createJsonRequest(
      '/api/establishments/pinella',
      'PATCH',
      { description: 'Invasão' },
      token
    );
    const patchRes = await patchEstablishmentByIdRoute(patchReq, { params: Promise.resolve({ id: 'pinella' }) });
    expect(patchRes.status).toBe(403);
  });

  it('Rotas /api/admin/* retornam 403 para partner e 200 para admin', async () => {
    const { token: partnerToken } = await authService.login({ email: TEST_USERS.five.email, password: TEST_USERS.five.password });
    const { token: adminToken } = await authService.login({ email: TEST_USERS.admin.email, password: TEST_USERS.admin.password });

    // 1. Listar estabelecimentos
    const partnerListReq = createJsonRequest('/api/admin/establishments', 'GET', undefined, partnerToken);
    expect((await getAdminEstablishmentsRoute(partnerListReq)).status).toBe(403);

    const adminListReq = createJsonRequest('/api/admin/establishments', 'GET', undefined, adminToken);
    expect((await getAdminEstablishmentsRoute(adminListReq)).status).toBe(200);

    // 2. Bloquear estabelecimento
    const partnerBlockReq = createJsonRequest('/api/admin/establishments/pinella/block', 'POST', {}, partnerToken);
    expect((await blockAdminEstablishmentRoute(partnerBlockReq, { params: Promise.resolve({ id: 'pinella' }) })).status).toBe(403);

    const adminBlockReq = createJsonRequest('/api/admin/establishments/pinella/block', 'POST', { reason: 'Bloqueio' }, adminToken);
    expect((await blockAdminEstablishmentRoute(adminBlockReq, { params: Promise.resolve({ id: 'pinella' }) })).status).toBe(200);

    // 3. Listar pagamentos
    const partnerPayReq = createJsonRequest('/api/admin/payments', 'GET', undefined, partnerToken);
    expect((await getAdminPaymentsRoute(partnerPayReq)).status).toBe(403);

    const adminPayReq = createJsonRequest('/api/admin/payments', 'GET', undefined, adminToken);
    expect((await getAdminPaymentsRoute(adminPayReq)).status).toBe(200);

    // 4. Reembolsar pagamento
    const partnerRefundReq = createJsonRequest('/api/admin/payments/sub_five_1/refund', 'POST', {}, partnerToken);
    expect((await refundAdminPaymentRoute(partnerRefundReq, { params: Promise.resolve({ id: 'sub_five_1' }) })).status).toBe(403);

    const adminRefundReq = createJsonRequest('/api/admin/payments/sub_five_1/refund', 'POST', { reason: 'Garantia' }, adminToken);
    expect((await refundAdminPaymentRoute(adminRefundReq, { params: Promise.resolve({ id: 'sub_five_1' }) })).status).toBe(200);

    // 5. Trilha de auditoria
    const partnerAudReq = createJsonRequest('/api/admin/audit-log', 'GET', undefined, partnerToken);
    expect((await getAdminAuditLogRoute(partnerAudReq)).status).toBe(403);

    const adminAudReq = createJsonRequest('/api/admin/audit-log', 'GET', undefined, adminToken);
    expect((await getAdminAuditLogRoute(adminAudReq)).status).toBe(200);
  });
});
