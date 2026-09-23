'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CrowdStatus, Establishment, Promotion, WeeklyScheduleItem } from '@/modules/establishments/types';
import type { AuthUser } from '@/modules/auth/types';

type PartnerAnalytics = {
  periodDays: number;
  views: number;
  whatsappClicks: number;
  mapClicks: number;
  instagramClicks: number;
  favorites: number;
  conversionRate: number;
};

const EMPTY_ANALYTICS: PartnerAnalytics = {
  periodDays: 30,
  views: 0,
  whatsappClicks: 0,
  mapClicks: 0,
  instagramClicks: 0,
  favorites: 0,
  conversionRate: 0,
};

export default function PartnerPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [analytics, setAnalytics] = useState<PartnerAnalytics>(EMPTY_ANALYTICS);

  // Form states
  const [crowdStatus, setCrowdStatus] = useState<CrowdStatus>('a confirmar');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoValidUntil, setPromoValidUntil] = useState('');
  const [promoDescription, setPromoDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login?redirect=/parceiro');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);
        setIsMasterAdmin(Boolean(authData.isMasterAdmin));

        const estRes = await fetch('/api/parceiro/establishment');
        if (estRes.ok) {
          const estData = await estRes.json();
          if (estData.establishment) {
            const est: Establishment = estData.establishment;
            setEstablishment(est);
            setCrowdStatus(est.crowdStatus || 'a confirmar');
            setPromoTitle(est.currentPromotion?.title || '');
            setPromoValidUntil(est.currentPromotion?.validUntil || '');
            setPromoDescription(est.currentPromotion?.description || '');
            setWhatsapp(est.whatsapp || '');
            setInstagram(est.instagram || '');
            setDescription(est.description || '');
            setAddress(est.address || '');
            setSchedule(est.weeklySchedule || []);

            const analyticsRes = await fetch('/api/parceiro/analytics?days=30');
            if (analyticsRes.ok) {
              const analyticsData = await analyticsRes.json();
              if (analyticsData.analytics) setAnalytics(analyticsData.analytics);
            }
          }
        }
      } catch {
        router.push('/login?redirect=/parceiro');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const promotion: Promotion | undefined = promoTitle
        ? {
            title: promoTitle,
            validUntil: promoValidUntil || 'Hoje',
            description: promoDescription,
          }
        : undefined;

      const payload = {
        establishmentId: establishment?.id,
        crowdStatus,
        currentPromotion: promotion,
        weeklySchedule: schedule,
        whatsapp,
        instagram,
        description,
        address,
      };

      const res = await fetch('/api/parceiro/establishment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao salvar alterações.');
      }

      setEstablishment(data.establishment);
      setMessage({ type: 'success', text: 'Alterações salvas com sucesso no servidor!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao salvar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddScheduleItem = () => {
    setSchedule([...schedule, { day: 'Sexta', title: 'Atração ao vivo', time: '20h', details: 'Couvert artístico' }]);
  };

  const handleRemoveScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: keyof WeeklyScheduleItem, value: string) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const metrics = [
    ['Visualizações (30 dias)', analytics.views.toLocaleString('pt-BR')],
    ['Cliques no WhatsApp', analytics.whatsappClicks.toLocaleString('pt-BR')],
    ['Rotas abertas', analytics.mapClicks.toLocaleString('pt-BR')],
    ['Cliques no Instagram', analytics.instagramClicks.toLocaleString('pt-BR')],
    ['Favoritos', analytics.favorites.toLocaleString('pt-BR')],
    ['Conversão estimada', `${analytics.conversionRate.toLocaleString('pt-BR')}%`],
  ];

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <p>Carregando painel do parceiro...</p>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {establishment && (
            <Link
              href={`/lugar/${establishment.id}`}
              className="button ghost"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              👁️ Ver Página Pública
            </Link>
          )}
          {isMasterAdmin && (
            <Link
              href="/admin"
              className="button light"
              style={{ padding: '8px 14px', fontSize: 13 }}
            >
              Painel Master Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid var(--border)', padding: '8px 14px', fontSize: 13 }}
          >
            Sair
          </button>
        </div>
      </header>

      <section className="page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <span className="badge">
              {user?.role === 'admin' ? '🛡️ Administrador Master' : '🏢 Dono do Estabelecimento'}
            </span>
            {establishment && (
              <span className="tag" style={{ background: establishment.publicationStatus === 'published' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 176, 32, 0.15)', color: establishment.publicationStatus === 'published' ? '#4ade80' : 'var(--accent)' }}>
                {establishment.publicationStatus === 'published' ? '● Publicado' : '● Em revisão'}
              </span>
            )}
          </div>
          <h1>{establishment?.name || 'Seu Estabelecimento'}</h1>
          <p>
            Logado como <b>{user?.name}</b> ({user?.email}) • Região: <b>{establishment?.region || 'Distrito Federal'}</b>
          </p>
        </div>
      </section>

      {message && (
        <div
          className="notice"
          style={{
            borderColor: message.type === 'success' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 77, 109, 0.4)',
            background: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 77, 109, 0.1)',
            color: message.type === 'success' ? '#4ade80' : '#ff9d9d',
            marginBottom: 24,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Indicadores */}
      <div className="metrics-grid">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <form onSubmit={handleSave} style={{ marginTop: 36, display: 'grid', gap: 24 }}>
        {/* Lotação e Destaque */}
        <div className="two-columns">
          <div className="panel">
            <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>🟢 Lotação em Tempo Real</h2>
            <p style={{ fontSize: 13, marginBottom: 14 }}>
              Atualize a movimentação atual para informar as pessoas que estão buscando onde ir agora.
            </p>
            <select
              value={crowdStatus}
              onChange={(e) => setCrowdStatus(e.target.value as CrowdStatus)}
              style={{ width: '100%', fontSize: 16, fontWeight: 700 }}
            >
              <option value="tranquilo">🟢 Tranquilo (mesas disponíveis)</option>
              <option value="movimentado">🟡 Movimentado (ótimo clima)</option>
              <option value="lotado">🔴 Lotado (fila na entrada)</option>
              <option value="a confirmar">⚪ A confirmar</option>
            </select>
          </div>

          <div className="panel">
            <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>🔥 Promoção do Dia</h2>
            <p style={{ fontSize: 13, marginBottom: 14 }}>
              Destaque ofertas como chopp duplo, drinks com desconto ou entrada off.
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              <input
                type="text"
                placeholder="Ex: Chopp em dobro até 20h"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Validade (Ex: Válido até 21h)"
                value={promoValidUntil}
                onChange={(e) => setPromoValidUntil(e.target.value)}
              />
              <input
                type="text"
                placeholder="Detalhes ou condições"
                value={promoDescription}
                onChange={(e) => setPromoDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Agenda Semanal */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>📅 Agenda e Programação da Semana</h2>
              <p style={{ fontSize: 13, margin: '4px 0 0' }}>
                Mantenha as atrações, dias de música ao vivo e eventos especiais atualizados.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddScheduleItem}
              style={{ background: 'var(--card-2)', fontSize: 13, padding: '8px 14px', border: '1px solid var(--border)' }}
            >
              + Adicionar Dia
            </button>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {schedule.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1.5fr 100px 1.5fr auto',
                  gap: 10,
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  padding: 10,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                }}
              >
                <input
                  type="text"
                  placeholder="Dia (Ex: Sexta)"
                  value={item.day}
                  onChange={(e) => handleScheduleChange(idx, 'day', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Atração / Título"
                  value={item.title}
                  onChange={(e) => handleScheduleChange(idx, 'title', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Horário"
                  value={item.time}
                  onChange={(e) => handleScheduleChange(idx, 'time', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Detalhes"
                  value={item.details}
                  onChange={(e) => handleScheduleChange(idx, 'details', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveScheduleItem(idx)}
                  style={{ background: 'rgba(255, 77, 109, 0.2)', color: '#ff9d9d', padding: '10px 12px' }}
                >
                  ✕
                </button>
              </div>
            ))}
            {schedule.length === 0 && (
              <div className="empty" style={{ textAlign: 'center', padding: 20 }}>
                Nenhum dia cadastrado na agenda. Clique em &quot;+ Adicionar Dia&quot;.
              </div>
            )}
          </div>
        </div>

        {/* Informações de Contato e Perfil */}
        <div className="panel">
          <h2 style={{ fontSize: '1.4rem', marginTop: 0 }}>📍 Informações do Perfil e Contato</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>WhatsApp</label>
              <input
                type="text"
                placeholder="(61) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Instagram</label>
              <input
                type="text"
                placeholder="https://instagram.com/seu.perfil"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Endereço</label>
            <input
              type="text"
              placeholder="Ex: CLN 408 Bloco C — Asa Norte"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: 13 }}>Descrição do Espaço</label>
            <textarea
              placeholder="Descreva a vibe, diferenciais, cardápio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', minHeight: 80 }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{ padding: 18, fontSize: 16, fontWeight: 800 }}
        >
          {saving ? 'Salvando alterações...' : '💾 Salvar Alterações do Estabelecimento'}
        </button>
      </form>
    </main>
  );
}
