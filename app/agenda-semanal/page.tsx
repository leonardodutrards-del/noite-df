import type { Metadata } from 'next';
import Link from 'next/link';
import { events } from '@/data/events';
import { EventCard } from '@/components/EventCard';
import { groupMonthlyAgendaByDate } from '@/lib/monthly-agenda';
import { getWeeklyAgenda, getWeeklyAgendaWindow } from '@/lib/weekly-agenda';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agenda semanal em Brasília e Entorno | Noite DF',
  description: 'Programação semanal de eventos no DF e Entorno, com datas e links dos organizadores. Atualizada conforme novas confirmações.',
  alternates: { canonical: '/agenda-semanal' },
  openGraph: { title: 'Agenda semanal | Noite DF', description: 'Confira eventos desta semana em Brasília e Entorno, com fontes dos organizadores.', url: '/agenda-semanal' },
};

export default function WeeklyAgendaPage() {
  const now = new Date();
  const window = getWeeklyAgendaWindow(now);
  const upcoming = getWeeklyAgenda(events, now);
  const days = groupMonthlyAgendaByDate(upcoming);
  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/">Início</Link><Link href="/agenda-mensal">Agenda mensal</Link><Link href="/#lugares">Lugares</Link><Link href="/fim-de-semana">Fim de semana</Link></nav>
      </header>
      <section className="page-heading">
        <span className="eyebrow">Para compartilhar</span>
        <h1>Agenda semanal em Brasília e Entorno</h1>
        <p>{window.label} · Horário de Brasília. Eventos publicados em canais dos organizadores.</p>
        <p>Eventos em andamento permanecem na agenda até o encerramento informado.</p>
        <p>Programação sujeita a alterações; confirme ingressos, horário e condições diretamente no link de cada evento.</p>
        <p>Esta página é alimentada automaticamente pela agenda mensal: quando um evento entra na semana atual, ele sobe para cá.</p>
      </section>
      <section aria-labelledby="weekly-events">
        <div className="section-title"><div><h2 id="weekly-events">Programação da semana</h2><p>{upcoming.length} {upcoming.length === 1 ? 'evento confirmado' : 'eventos confirmados'} nesta seleção.</p></div></div>
        {upcoming.length ? <div style={{ display: 'grid', gap: 36 }}>{days.map(day => (
          <section key={day.date} aria-labelledby={`week-${day.date}`}>
            <h3 id={`week-${day.date}`}>{day.label}</h3>
            <div className="grid">{day.events.map(event => <EventCard event={event} key={event.id} />)}</div>
          </section>
        ))}</div> :
          <div className="empty"><h3>Aguardando novas confirmações</h3><p>As datas entram aqui após verificação nos canais oficiais dos organizadores.</p></div>}
      </section>
      <p style={{ margin: '32px 0' }}><Link href="/agenda-mensal">Ver agenda mensal →</Link></p>
    </main>
  );
}
