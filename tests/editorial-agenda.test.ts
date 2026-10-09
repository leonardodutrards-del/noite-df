import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { editorialEventToPublic, validateEditorialEvent, type EditorialEvent } from '@/modules/events/editorial';
import { places } from '@/data/places';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), list: vi.fn(), find: vi.fn(), save: vi.fn(), place: vi.fn(), audit: vi.fn() }));
vi.mock('@/modules/auth/session', () => ({ requireMasterAdmin: mocks.auth }));
vi.mock('@/modules/auth/service', () => ({ authService: { logAudit: mocks.audit } }));
vi.mock('@/modules/establishments/service', () => ({ establishmentService: { getById: mocks.place } }));
vi.mock('@/modules/events/store', () => ({ listEditorialEvents: mocks.list, findEditorialEvent: mocks.find, saveEditorialEvent: mocks.save }));
import { GET, POST, PATCH } from '@/app/api/admin/events/route';

const now = new Date('2026-10-09T13:00:00Z');
const input = { establishment_id: 'oscarito-brasilia', title: 'Sextanejada no Oscarito', category: 'Sertanejo', description: 'Show no SIG Quadra 1, Lote 985.', official_url: 'https://www.sympla.com.br/evento/sextanejada-no-oscarito/3606314', starts_at: '2026-10-09T19:00:00-03:00', ends_at: '2026-10-10T02:00:00-03:00', publication_status: 'published', sourceConfirmed: true };
const row: EditorialEvent = { ...validateEditorialEvent(input, now), id: '11111111-1111-4111-8111-111111111111', updated_at: now.toISOString() };
const place = places.find(place => place.id === 'oscarito-brasilia')!;
const request = (body: unknown) => new NextRequest('http://localhost/api/admin/events', { method: 'POST', body: JSON.stringify(body) });

describe('Agenda editorial com revisão', () => {
  afterEach(() => vi.useRealTimers());
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); vi.setSystemTime(now);
    mocks.auth.mockResolvedValue({ id: 'master', email: 'admin@example.test', role: 'master_admin' });
    mocks.place.mockResolvedValue(place); mocks.list.mockResolvedValue([]); mocks.find.mockResolvedValue(row); mocks.save.mockResolvedValue(row);
  });
  it('preserva o horário de Brasília em evento que termina após meia-noite', () => {
    const event = editorialEventToPublic(row, place, now)!;
    expect(event.startsAt).toBe('2026-10-09T19:00:00.000-03:00');
    expect(Date.parse(event.startsAt!)).toBe(Date.parse(input.starts_at));
    expect(event.dateLabel).toContain('10/10/2026');
    expect(event.source?.kind).toBe('official');
  });
  it('oculta rascunho, pendente, suspenso, evento vencido e local suspenso', () => {
    for (const publication_status of ['draft', 'pending_review', 'suspended'] as const) expect(editorialEventToPublic({ ...row, publication_status }, place, now)).toBeNull();
    expect(editorialEventToPublic(row, place, new Date(row.ends_at))).toBeNull();
    expect(editorialEventToPublic(row, { ...place, publicationStatus: 'suspended' }, now)).toBeNull();
    expect(editorialEventToPublic({ ...row, verified_at: null }, place, now)).toBeNull();
  });
  it('rejeita fontes inválidas, datas ambíguas e publicação sem conferência', () => {
    for (const patch of [{ official_url: 'javascript:alert(1)' }, { official_url: '/fonte' }, { sourceConfirmed: false }, { starts_at: '2026-10-09T19:00' }, { starts_at: '2026-02-30T19:00:00-03:00' }, { ends_at: input.starts_at }]) expect(() => validateEditorialEvent({ ...input, ...patch }, now)).toThrow('INVALID_EVENT');
  });
  it('não permite publicar evento encerrado', () => {
    expect(() => validateEditorialEvent(input, new Date(row.ends_at))).toThrow('INVALID_EVENT');
  });
  it('bloqueia leitura e escrita sem autorização antes de acessar o banco', async () => {
    mocks.auth.mockRejectedValue(new Error('FORBIDDEN_MASTER_ADMIN_REQUIRED'));
    expect((await GET(request({}))).status).toBe(403);
    expect((await POST(request(input))).status).toBe(403);
    expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it('publica com revisão no servidor e registra autoria/auditoria', async () => {
    expect((await POST(request(input))).status).toBe(201);
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ verified_at: now.toISOString(), created_by: 'master', updated_by: 'master' }), undefined);
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: 'create_event', entityId: row.id }));
  });
  it('rejeita edição de outra sessão para evitar sobrescrita', async () => {
    expect((await PATCH(request({ ...input, id: row.id, expectedUpdatedAt: 'old' }))).status).toBe(409);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('evita duplicar a mesma atração no mesmo local e horário', async () => {
    mocks.list.mockResolvedValue([row]);
    expect((await POST(request(input))).status).toBe(409);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('salva rascunho sem atribuir uma conferência oficial', async () => {
    expect((await POST(request({ ...input, publication_status: 'draft', sourceConfirmed: false }))).status).toBe(201);
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ verified_at: null, publication_status: 'draft' }), undefined);
  });
});
