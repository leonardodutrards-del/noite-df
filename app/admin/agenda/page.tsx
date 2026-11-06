import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { AgendaEditor } from '@/components/AgendaEditor';
import { listEditorialEvents } from '@/modules/events/store';
import { editorialEventToPublic } from '@/modules/events/editorial';
import { prepareAgendaCommunication } from '@/modules/events/communication';
import { MenuImageEditor } from '@/components/MenuImageEditor';
import { supabaseAdminJson } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

type SourceRow = { id: string; label: string; url: string | null; entity_id: string };
type CheckRow = { source_id: string; check_status: string; http_status: number | null; checked_at: string; note: string | null };

export default async function AdminAgendaPage() {
  const actor = await requireMasterAdmin().catch(() => null);
  if (!actor) redirect('/login?redirect=/admin/agenda');
  const [places, events] = await Promise.all([establishmentService.listAllForAdmin(actor), listEditorialEvents()]);
  const [sourceRegistry, sourceChecks] = await Promise.all([
    supabaseAdminJson<SourceRow[]>('data_sources?entity_type=eq.establishment&source_kind=eq.official&url=not.is.null&select=id,label,url,entity_id&order=captured_at.desc&limit=200').catch(() => []),
    supabaseAdminJson<CheckRow[]>('agenda_source_checks?select=source_id,check_status,http_status,checked_at,note&order=checked_at.desc&limit=100').catch(() => []),
  ]);
  const sourceById = new Map(sourceRegistry.map(source => [source.id, source]));
  const latestChecks = sourceChecks.filter((check, index, all) => all.findIndex(item => item.source_id === check.source_id) === index).slice(0, 30);
  const checkLabels: Record<string, string> = { baseline: 'Primeira leitura', ok: 'Sem mudança', changed: 'Mudou · revisar', http_error: 'Erro HTTP', blocked: 'Bloqueada', error: 'Falha' };
  const now = new Date();
  const publicEvents = events.flatMap(event => {
    const place = places.find(place => place.id === event.establishment_id);
    const item = place ? editorialEventToPublic(event, place, now) : null;
    return item ? [item] : [];
  });
  const communication = prepareAgendaCommunication(publicEvents, now);
  const sourcePlaces = places.map(place => {
    const instagram = place.instagram?.trim();
    const instagramUrl = instagram
      ? (instagram.startsWith('http') ? instagram : `https://www.instagram.com/${instagram.replace(/^@/, '').replace(/\/$/, '')}/`)
      : null;
    const agendaUrl = place.agendaUrl?.trim() || null;
    const lastChecked = place.lastUpdated ? Date.parse(place.lastUpdated) : Number.NaN;
    const ageDays = Number.isFinite(lastChecked) ? Math.max(0, Math.floor((now.getTime() - lastChecked) / 86400000)) : null;
    return { id: place.id, name: place.name, region: place.region, instagramUrl, agendaUrl, ageDays, hasSource: Boolean(instagramUrl || agendaUrl) };
  }).sort((a, b) => (a.ageDays ?? 9999) - (b.ageDays ?? 9999));
  const sourcesWithoutLinks = sourcePlaces.filter(place => !place.hasSource).length;
  const sourcesNeedingReview = sourcePlaces.filter(place => place.ageDays === null || place.ageDays > 14).length;
  return <main className="container"><header className="topbar"><Link className="brand" href="/admin">Noite DF · Admin</Link><Link href="/agenda-semanal">Ver agenda pública</Link></header>
    <section className="page-heading"><h1>Gerenciar agenda</h1><p>Cadastre e corrija a programação sem uma nova publicação do site. Eventos publicados aparecem nas agendas de hoje, semana, mês e fim de semana até o encerramento.</p></section>
    <AgendaEditor initialEvents={events} initialNow={new Date().getTime()} places={places.map(({ id, name, publicationStatus }) => ({ id, name, publicationStatus }))} />
    <section className="panel" style={{ marginTop: 24 }}>
      <h2>Fontes para monitoramento da agenda</h2>
      <p>Centralize os canais públicos cadastrados para a equipe conferir novas programações. O monitoramento automático consulta somente domínios HTTPS das fontes oficiais cadastradas pela equipe; Instagram não é rastreado.</p>
      <div className="admin-stats-grid" style={{ margin: '16px 0' }}>
        <div><strong>{sourcePlaces.length}</strong><span>estabelecimentos no guia</span></div>
        <div><strong>{sourcePlaces.length - sourcesWithoutLinks}</strong><span>com ao menos uma fonte cadastrada</span></div>
        <div><strong>{sourcesNeedingReview}</strong><span>sem atualização recente (14 dias)</span></div>
        <div><strong>{sourcesWithoutLinks}</strong><span>sem link de Instagram ou agenda</span></div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead><tr><th>Estabelecimento</th><th>Região</th><th>Instagram</th><th>Agenda / site</th><th>Última atualização do cadastro</th></tr></thead>
          <tbody>{sourcePlaces.map(place => <tr key={place.id}>
            <td>{place.name}</td><td>{place.region}</td>
            <td>{place.instagramUrl ? <a href={place.instagramUrl} target="_blank" rel="noreferrer">Abrir perfil</a> : 'Não cadastrado'}</td>
            <td>{place.agendaUrl ? <a href={place.agendaUrl} target="_blank" rel="noreferrer">Abrir fonte</a> : 'Não cadastrado'}</td>
            <td>{place.ageDays === null ? 'Sem data' : place.ageDays === 0 ? 'Hoje' : `Há ${place.ageDays} dias`}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="field-hint">A idade acima considera a atualização do cadastro do estabelecimento, não uma confirmação de que a programação foi verificada.</p>
    </section>
    <section className="panel" style={{ marginTop: 24 }}>
      <h2>Histórico de verificações automáticas</h2>
      <p>O monitor consulta até 12 fontes por dia em rodízio, registra somente o hash do conteúdo e sinaliza mudanças. Nenhum evento é publicado automaticamente.</p>
      {latestChecks.length ? <div style={{ overflowX: 'auto' }}><table>
        <thead><tr><th>Fonte</th><th>Resultado</th><th>HTTP</th><th>Verificado em</th><th>Observação</th></tr></thead>
        <tbody>{latestChecks.map(check => <tr key={check.source_id}>
          <td>{sourceById.get(check.source_id)?.label || sourceById.get(check.source_id)?.entity_id || check.source_id}</td>
          <td>{checkLabels[check.check_status] || check.check_status}</td>
          <td>{check.http_status ?? '—'}</td>
          <td>{new Date(check.checked_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
          <td>{check.note || '—'}</td>
        </tr>)}</tbody>
      </table></div> : <p className="field-hint">Nenhuma verificação registrada ainda. O cron diário usa o segredo CRON_SECRET da Vercel e monta a lista de domínios a partir das fontes oficiais cadastradas.</p>}
    </section>
    <details className="panel" style={{ marginTop: 28 }}><summary>Atualizar imagem de cardápio · opcional</summary><MenuImageEditor places={places.map(({ id, name }) => ({ id, name }))} /></details>
    <details className="panel" style={{ marginTop: 28 }}><summary>Textos sugeridos para divulgação · opcional</summary><h2>Divulgação preparada a partir da agenda</h2>
      <p>Somente eventos publicados, confirmados e ainda válidos. Estes textos são propostas para revisão e não são enviados ao Instagram. Reabra a página após salvar a programação para atualizar as propostas.</p>
      {communication.feed.map(draft => <details key={draft.id} style={{ marginTop: 16 }}><summary>{draft.title}</summary><p>{draft.concept}</p><p className="field-hint">Referência: {draft.id} · Válido até {draft.expiresAt}</p><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit' }}>{draft.caption}</pre></details>)}
      {communication.story && <details style={{ marginTop: 16 }}><summary>Proposta única de Story do dia</summary><p>{communication.story.concept}</p><p className="field-hint">Referência: {communication.story.id}</p><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit' }}>{communication.story.caption}</pre><p>Fontes:</p>{communication.story.sources.map(source => <p key={source}><a href={source} target="_blank" rel="noreferrer">{source}</a></p>)}</details>}
      {!communication.feed.length && <p>Sem eventos confirmados para preparar divulgação.</p>}
    </details>
  </main>;
}
