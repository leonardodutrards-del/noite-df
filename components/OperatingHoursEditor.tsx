'use client';

import { useState } from 'react';
import type { Establishment } from '@/modules/establishments/types';
import type { DayOpeningHours, OperatingHours, WeekdayKey } from '@/modules/establishments/opening-hours';

const DAYS: { key: WeekdayKey; label: string }[] = [
  { key: 'monday', label: 'Segunda' }, { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' }, { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' }, { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];
const DEFAULT_DAY: DayOpeningHours = { closed: true, open: '18:00', close: '23:00' };

export function OperatingHoursEditor({ place, onSaved }: { place: Establishment; onSaved: () => void }) {
  const initial = place.operatingHours as OperatingHours | undefined;
  const [schedule, setSchedule] = useState<OperatingHours['schedule']>(() =>
    Object.fromEntries(DAYS.map(({ key }) => [key, initial?.schedule?.[key] ?? DEFAULT_DAY])) as OperatingHours['schedule']
  );
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateDay = (key: WeekdayKey, patch: Partial<DayOpeningHours>) => {
    setSchedule((current) => ({ ...current, [key]: { ...(current[key] ?? DEFAULT_DAY), ...patch } }));
  };

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/establishments/${encodeURIComponent(place.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatingHours: {
            timezone: 'America/Sao_Paulo',
            schedule,
            sourceUrl: sourceUrl.trim(),
            checkedAt: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }),
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Não foi possível salvar os horários.');
      setMessage('Horários salvos.');
      onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel" style={{ width: '100%', marginTop: 12 }}>
      <h4 style={{ marginTop: 0 }}>Horário de funcionamento · {place.name}</h4>
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Preencha os dias e indique uma fonte pública (site ou perfil oficial). Horários sem fonte confirmada não serão exibidos como “aberto agora”.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {DAYS.map(({ key, label }) => {
          const day = schedule[key] ?? DEFAULT_DAY;
          return (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(70px, .8fr) auto repeat(2, minmax(80px, 1fr))', gap: 8, alignItems: 'center' }}>
              <strong style={{ fontSize: 13 }}>{label}</strong>
              <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 12 }}>
                <input type="checkbox" checked={day.closed} onChange={(event) => updateDay(key, { closed: event.target.checked })} />
                Fechado
              </label>
              <input aria-label={`Abertura ${label}`} type="time" value={day.open} disabled={day.closed} onChange={(event) => updateDay(key, { open: event.target.value })} />
              <input aria-label={`Fechamento ${label}`} type="time" value={day.close} disabled={day.closed} onChange={(event) => updateDay(key, { close: event.target.value })} />
            </div>
          );
        })}
      </div>
      <label style={{ display: 'grid', gap: 5, marginTop: 12, fontSize: 13 }}>
        Fonte oficial dos horários (URL)
        <input type="url" placeholder="https://..." value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} />
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" disabled={saving || !sourceUrl.trim()} onClick={save}>{saving ? 'Salvando…' : 'Salvar horários'}</button>
        {message && <span role="status" style={{ fontSize: 13 }}>{message}</span>}
      </div>
    </section>
  );
}
