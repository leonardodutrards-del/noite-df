import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicAgenda } from '@/modules/events/public-agenda';
import { EventCard } from '@/components/EventCard';
import { dateInBrasilia, getTodayEvents } from '@/lib/today-agenda';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'O que fazer hoje em Brasília | Noite DF',
  description: 'Eventos de hoje no DF e Entorno, com horários e links para as fontes dos organizadores.',
  alternates: { canonical: '/hoje' },
  openGraph: { title: 'Eventos de hoje | Noite DF', description: 'Confira a programação confirmada para hoje em Brasília.', url: '/hoje' },
};

export default async function TodayAgendaPage() {
  const events = await getPublicAgenda();
  const now = new Date();
  const today = getTodayEvents(events, now);
  const [year, month, day] = dateInBrasilia(now).split('-');
  return (
    <main className="container">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/">Início</Link><Link href="/agenda-semanal">Agenda semanal</Link><Link href="/agenda-mensal">Agenda mensal</Link><Link href="/#lugares">Lugares</Link></nav>
      </header>
      <section className="page-heading">
        <span className="eyebrow">Para compartilhar</span>
        <h1>O que fazer hoje em Brasília</h1>
        <p>{day}/{month}/{year} · Horário de Brasília · Eventos confirmados em canais dos organizadores.</p>
        <p>Eventos em andamento podem aparecer até o encerramento. Confirme ingressos, condições e mudanças na fonte de cada programação.</p>
      </section>
      <section aria-labelledby="today-events">
        <div className="section-title"><div><h2 id="today-events">Eventos de hoje</h2><p>{today.length} {today.length === 1 ? 'evento disponível' : 'eventos disponíveis'} nesta seleção.</p></div></div>
        {today.length ? <div className="grid">{today.map((event) => <EventCard key={event.id} event={event} />)}</div> :
          <div className="empty"><h3>Sem eventos confirmados para hoje</h3><p>Confira a agenda semanal para programar sua próxima saída.</p></div>}
      </section>
      <p style={{ margin: '32px 0' }}><Link href="/agenda-semanal">Ver agenda semanal →</Link> · <Link href="/agenda-mensal">Ver agenda mensal →</Link></p>
    </main>
  );
}
