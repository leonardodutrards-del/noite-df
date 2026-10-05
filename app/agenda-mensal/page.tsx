import type { Metadata } from 'next';
import Link from 'next/link';
import { events } from '@/data/events';
import { EventCard } from '@/components/EventCard';
import {
  getMonthlyAgenda,
  getMonthlyAgendaWindow,
  groupMonthlyAgendaByDate,
} from '@/lib/monthly-agenda';
import { getWeeklyAgenda } from '@/lib/weekly-agenda';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agenda mensal de eventos em Brasília e Entorno | Noite DF',
  description: 'Agenda mensal com eventos confirmados no DF e Entorno, organizada por data e atualizada com fontes oficiais.',
  alternates: { canonical: '/agenda-mensal' },
  openGraph: {
    title: 'Agenda mensal | Noite DF',
    description: 'Veja os eventos confirmados do mês em Brasília e Entorno, organizados por data.',
    url: '/agenda-mensal',
  },
};

export default function MonthlyAgendaPage() {
  const now = new Date();
  const window = getMonthlyAgendaWindow(now);
  const monthly = getMonthlyAgenda(events, now);
  const weekly = getWeeklyAgenda(events, now);
  const grouped = groupMonthlyAgendaByDate(monthly);
  const weeklyIds = new Set(weekly.map((event) => event.id));

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/">Início</Link>
          <Link href="/agenda-semanal">Agenda semanal</Link>
          <Link href="/fim-de-semana">Fim de semana</Link>
        </nav>
      </header>

      <section className="page-heading">
        <span className="eyebrow">Calendário do mês</span>
        <h1>Agenda mensal de eventos</h1>
        <p>
          {window.label} · eventos futuros confirmados em Brasília e Entorno, organizados pela data mais próxima.
        </p>
        <p>
          Quando um evento entra na semana atual, ele passa automaticamente a aparecer também na Agenda Semanal.
        </p>
      </section>

      <section className="panel" style={{ marginBottom: 28 }}>
        <span className="badge">Semana atual</span>
        <h2 style={{ marginBottom: 8 }}>{weekly.length} {weekly.length === 1 ? 'evento em destaque' : 'eventos em destaque'}</h2>
        <p style={{ marginBottom: 0 }}>
          Esses são os eventos do mês que já entraram na janela semanal e devem receber prioridade de divulgação.
        </p>
        <div style={{ marginTop: 16 }}>
          <Link className="button" href="/agenda-semanal">Abrir agenda semanal</Link>
        </div>
      </section>

      <section aria-labelledby="monthly-events">
        <div className="section-title">
          <div>
            <h2 id="monthly-events">Próximos eventos de {window.label}</h2>
            <p>{monthly.length} {monthly.length === 1 ? 'evento confirmado' : 'eventos confirmados'} ainda por acontecer neste mês.</p>
          </div>
        </div>

        {grouped.length ? (
          <div style={{ display: 'grid', gap: 28 }}>
            {grouped.map((group) => (
              <section key={group.date} className="agenda-date-group">
                <div className="agenda-date-heading">
                  <strong>{group.label}</strong>
                  <span>{group.events.length} {group.events.length === 1 ? 'evento' : 'eventos'}</span>
                </div>
                <div className="grid">
                  {group.events.map((event) => (
                    <div key={event.id} style={{ position: 'relative' }}>
                      {weeklyIds.has(event.id) ? <span className="agenda-week-badge">Esta semana</span> : null}
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Aguardando novas confirmações</h3>
            <p>Novos eventos entram no calendário assim que são verificados em fontes oficiais.</p>
          </div>
        )}
      </section>
    </main>
  );
}
