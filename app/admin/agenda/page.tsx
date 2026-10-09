import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { AgendaEditor } from '@/components/AgendaEditor';
import { listEditorialEvents } from '@/modules/events/store';
import { editorialEventToPublic } from '@/modules/events/editorial';
import { prepareAgendaCommunication } from '@/modules/events/communication';
import { MenuImageEditor } from '@/components/MenuImageEditor';

export const dynamic = 'force-dynamic';

export default async function AdminAgendaPage() {
  const actor = await requireMasterAdmin().catch(() => null);
  if (!actor) redirect('/login?redirect=/admin/agenda');
  const [places, events] = await Promise.all([establishmentService.listAllForAdmin(actor), listEditorialEvents()]);
  const now = new Date();
  const publicEvents = events.flatMap(event => {
    const place = places.find(place => place.id === event.establishment_id);
    const item = place ? editorialEventToPublic(event, place, now) : null;
    return item ? [item] : [];
  });
  const communication = prepareAgendaCommunication(publicEvents, now);
  return <main className="container"><header className="topbar"><Link className="brand" href="/admin">Noite DF · Admin</Link><Link href="/agenda-semanal">Ver agenda pública</Link></header>
    <section className="page-heading"><h1>Gerenciar agenda</h1><p>Cadastre e corrija a programação sem uma nova publicação do site. Eventos publicados aparecem nas agendas de hoje, semana, mês e fim de semana até o encerramento.</p></section>
    <AgendaEditor initialEvents={events} initialNow={new Date().getTime()} places={places.map(({ id, name, publicationStatus }) => ({ id, name, publicationStatus }))} />
    <MenuImageEditor places={places.map(({ id, name }) => ({ id, name }))} />
    <section className="panel" style={{ marginTop: 28 }}><h2>Divulgação preparada a partir da agenda</h2>
      <p>Somente eventos publicados, confirmados e ainda válidos. Estes textos são propostas para revisão e não são enviados ao Instagram. Reabra a página após salvar a programação para atualizar as propostas.</p>
      {communication.feed.map(draft => <details key={draft.id} style={{ marginTop: 16 }}><summary>{draft.title}</summary><p>{draft.concept}</p><p className="field-hint">Referência: {draft.id} · Válido até {draft.expiresAt}</p><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit' }}>{draft.caption}</pre></details>)}
      {communication.story && <details style={{ marginTop: 16 }}><summary>Proposta única de Story do dia</summary><p>{communication.story.concept}</p><p className="field-hint">Referência: {communication.story.id}</p><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'inherit' }}>{communication.story.caption}</pre><p>Fontes:</p>{communication.story.sources.map(source => <p key={source}><a href={source} target="_blank" rel="noreferrer">{source}</a></p>)}</details>}
      {!communication.feed.length && <p>Sem eventos confirmados para preparar divulgação.</p>}
    </section>
  </main>;
}
