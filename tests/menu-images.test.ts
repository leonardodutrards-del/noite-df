import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { validateMenu } from '@/modules/establishments/menu';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), update: vi.fn(), get: vi.fn() }));
vi.mock('@/modules/auth/session', () => ({ requireMasterAdmin: mocks.auth }));
vi.mock('@/modules/establishments/service', () => ({ establishmentService: { update: mocks.update, getById: mocks.get } }));
import { PATCH } from '@/app/api/admin/establishments/[id]/route';

const image = { url: 'https://images.example.com/menu.jpg', alt: 'Cardápio, página 1', credit: 'Estabelecimento', sourceUrl: 'https://example.com/cardapio', authorized: true };
const menu = { url: 'https://example.com/cardapio', checkedAt: '2026-10-09', images: [image], examples: [{ name: 'Porção', price: 25 }] };
const request = (value: unknown) => new NextRequest('http://localhost/api/admin/establishments/place', { method: 'PATCH', body: JSON.stringify({ menu: value }) });
const context = { params: Promise.resolve({ id: 'place' }) };

describe('Cardápio digital em imagens', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ id: 'master', role: 'master_admin' }); mocks.update.mockResolvedValue({ id: 'place', menu }); });
  it('preserva link completo, preços e ordem das páginas', () => {
    expect(validateMenu(menu)).toEqual(menu);
    expect(validateMenu({ url: menu.url, checkedAt: menu.checkedAt })?.images).toBeUndefined();
  });
  it('rejeita imagens sem autorização, data inválida, URLs inseguras e mais de 12 páginas', () => {
    for (const patch of [{ images: [{ ...image, authorized: false }] }, { images: Array(13).fill(image) }, { checkedAt: '2026-02-30' }, { url: 'javascript:alert(1)' }, { examples: [{ name: 'Porção', price: -1 }] }]) expect(() => validateMenu({ ...menu, ...patch })).toThrow('INVALID_MENU');
  });
  it('não permite salvar imagens sem permissão de Master Admin', async () => {
    mocks.auth.mockRejectedValue(new Error('FORBIDDEN_MASTER_ADMIN_REQUIRED'));
    expect((await PATCH(request(menu), context)).status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('valida no servidor antes de salvar e não substitui preços por dados do formulário', async () => {
    expect((await PATCH(request(menu), context)).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith('place', { menu }, expect.objectContaining({ role: 'master_admin' }));
    mocks.update.mockClear();
    expect((await PATCH(request({ ...menu, images: [{ ...image, authorized: false }] }), context)).status).toBe(400);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
