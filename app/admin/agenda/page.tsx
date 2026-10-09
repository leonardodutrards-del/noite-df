import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { AgendaEditor } from '@/components/AgendaEditor';
import { listEditorialEvents } from '@/modules/events/store';

export const dynamic = 'force-dynamic';

export default async function AdminAgendaPage() {
  const actor = await requireMasterAdmin().catch(() => null);
  if (!actor) redirect('/login?redirect=/admin/agenda');
  const [places, events] = await Promise.all([establishmentService.listAllForAdmin(actor), listEditorialEvents()]);
  return <main className="container"><header className="topbar"><Link className="brand" href="/admin">Noite DF · Admin</Link><Link href="/agenda-semanal">Ver agenda pública</Link></header>
    <section className="page-heading"><h1>Gerenciar agenda</h1><p>Cadastre e corrija a programação sem uma nova publicação do site. Eventos publicados aparecem nas agendas de hoje, semana, mês e fim de semana até o encerramento.</p></section>
    <AgendaEditor initialEvents={events} initialNow={new Date().getTime()} places={places.map(({ id, name, publicationStatus }) => ({ id, name, publicationStatus }))} />
  </main>;
}
