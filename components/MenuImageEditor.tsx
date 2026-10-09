'use client';

import { useState } from 'react';
import type { Establishment } from '@/modules/establishments/types';
import type { EventArtwork } from '@/modules/events/artwork';

type Menu = NonNullable<Establishment['menu']>;
const empty: Menu = { url: '', checkedAt: '', images: [] };

export function MenuImageEditor({ places }: { places: { id: string; name: string }[] }) {
  const [id, setId] = useState('');
  const [menu, setMenu] = useState<Menu>(empty);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState('');
  async function load() {
    setBusy(true); setLoaded(false); setMessage('');
    try {
      const response = await fetch(`/api/admin/establishments/${encodeURIComponent(id)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar o cardápio.');
      setMenu(data.establishment.menu || empty); setLoaded(true);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao carregar.'); }
    finally { setBusy(false); }
  }
  const changeImage = (index: number, patch: Partial<EventArtwork>) => setMenu({ ...menu, images: menu.images?.map((image, position) => position === index ? { ...image, ...patch } : image) });
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/establishments/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menu }) });
      const data = await response.json();
      if (!response.ok || !data.establishment) throw new Error(data.error || 'Não foi possível salvar o cardápio.');
      setMenu(data.establishment.menu); setMessage('Cardápio atualizado no perfil do estabelecimento.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Falha ao salvar.'); }
    finally { setBusy(false); }
  }
  return <section className="panel" style={{ marginTop: 28 }}><h2>Cardápio digital em imagens</h2>
    <p>Cadastre até 12 páginas na ordem de leitura. Elas aparecem no perfil do local, com opção de ampliar e crédito. O link para o cardápio completo continua disponível.</p>
    <label>Estabelecimento<select disabled={busy} value={id} onChange={event => { setId(event.target.value); setLoaded(false); setMessage(''); }}><option value="">Selecione</option>{places.map(place => <option value={place.id} key={place.id}>{place.name}</option>)}</select></label>
    <button type="button" disabled={!id || busy} onClick={load}>Carregar cardápio</button>
    {message && <p role="status">{message}</p>}
    {loaded && <form onSubmit={save} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
      <label>Link do cardápio completo<input required type="url" value={menu.url} onChange={event => setMenu({ ...menu, url: event.target.value })} /></label>
      <label>Data de conferência<input required type="date" value={menu.checkedAt} onChange={event => setMenu({ ...menu, checkedAt: event.target.value })} /></label>
      {menu.images?.map((image, index) => <fieldset key={index} disabled={busy} style={{ display: 'grid', gap: 12 }}><legend>Página {index + 1}</legend>
        <label>Link direto HTTPS da imagem<input required type="url" maxLength={2000} value={image.url} onChange={event => changeImage(index, { url: event.target.value })} /></label>
        <label>Descrição acessível<input required maxLength={300} value={image.alt} onChange={event => changeImage(index, { alt: event.target.value })} /></label>
        <label>Crédito<input required maxLength={200} value={image.credit} onChange={event => changeImage(index, { credit: event.target.value })} /></label>
        <label>Fonte oficial da imagem<input required type="url" maxLength={2000} value={image.sourceUrl} onChange={event => changeImage(index, { sourceUrl: event.target.value })} /></label>
        <label><input type="checkbox" style={{ width: 'auto' }} required checked={image.authorized} onChange={event => changeImage(index, { authorized: event.target.checked })} /> Tenho autorização para usar esta página do cardápio.</label>
        <button type="button" onClick={() => setMenu({ ...menu, images: menu.images?.filter((_, position) => position !== index) })}>Remover página</button>
      </fieldset>)}
      <button type="button" disabled={busy || (menu.images?.length ?? 0) >= 12} onClick={() => setMenu({ ...menu, images: [...(menu.images || []), { url: '', alt: '', credit: '', sourceUrl: menu.url, authorized: false }] })}>Adicionar página em imagem</button>
      <button type="submit" disabled={busy}>{busy ? 'Salvando…' : 'Salvar cardápio'}</button>
    </form>}
  </section>;
}
