'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Establishment, PublicationStatus } from '@/modules/establishments/types';
import type { SubscriptionAccount } from '@/modules/payments/types';
import type { AuditLogEntry, AuthUser } from '@/modules/auth/types';

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<'establishments' | 'payments' | 'audit'>('establishments');
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [payments, setPayments] = useState<SubscriptionAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login?redirect=/admin');
          return;
        }
        const authData = await authRes.json();
        if (!isMounted) return;

        if (authData.user.role !== 'admin') {
          setUser(authData.user);
          setLoading(false);
          return;
        }
        setUser(authData.user);

        const [estRes, payRes, audRes] = await Promise.all([
          fetch('/api/admin/establishments'),
          fetch('/api/admin/payments'),
          fetch('/api/admin/audit-log'),
        ]);

        if (estRes.ok && isMounted) {
          const d = await estRes.json();
          setEstablishments(d.establishments || []);
        }
        if (payRes.ok && isMounted) {
          const d = await payRes.json();
          setPayments(d.payments || []);
        }
        if (audRes.ok && isMounted) {
          const d = await audRes.json();
          setAuditLogs(d.auditLogs || []);
        }
      } catch {
        if (isMounted) router.push('/login?redirect=/admin');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const reloadData = async () => {
    try {
      const [estRes, payRes, audRes] = await Promise.all([
        fetch('/api/admin/establishments'),
        fetch('/api/admin/payments'),
        fetch('/api/admin/audit-log'),
      ]);
      if (estRes.ok) {
        const d = await estRes.json();
        setEstablishments(d.establishments || []);
      }
      if (payRes.ok) {
        const d = await payRes.json();
        setPayments(d.payments || []);
      }
      if (audRes.ok) {
        const d = await audRes.json();
        setAuditLogs(d.auditLogs || []);
      }
    } catch {
      // Ignore
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleStatusChange = async (id: string, newStatus: PublicationStatus) => {
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/establishments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicationStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar status.');

      setFeedback({ type: 'success', text: `Status do estabelecimento atualizado para "${newStatus}".` });
      await reloadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao alterar status.' });
    }
  };

  const handleBlockEstablishment = async (id: string) => {
    const reason = prompt('Informe o motivo do bloqueio / suspensão:') || 'Bloqueio administrativo.';
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/establishments/${id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao bloquear estabelecimento.');

      setFeedback({ type: 'success', text: 'Estabelecimento bloqueado e suspenso com sucesso.' });
      await reloadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao bloquear.' });
    }
  };

  const handleRefund = async (paymentId: string) => {
    const reason = prompt('Informe a justificativa do reembolso:') || 'Reembolso autorizado pelo Master Admin.';
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao processar reembolso.');

      setFeedback({ type: 'success', text: `Reembolso de R$ ${(data.payment.amountCents / 100).toFixed(2)} processado com sucesso.` });
      await reloadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao reembolsar.' });
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
        <p>Carregando painel de governança...</p>
      </main>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <main className="container" style={{ paddingTop: 60 }}>
        <header className="topbar">
          <Link className="brand" href="/">Noite DF</Link>
          <button onClick={handleLogout} style={{ background: 'var(--card-2)', fontSize: 13 }}>Sair</button>
        </header>
        <div className="panel" style={{ textAlign: 'center', padding: 40, marginTop: 40 }}>
          <span className="badge" style={{ borderColor: '#ff4d6d', color: '#ff4d6d' }}>Acesso Restrito</span>
          <h1 style={{ fontSize: '2rem', margin: '16px 0' }}>Acesso não autorizado ao Painel Master</h1>
          <p style={{ maxWidth: 500, margin: '0 auto 24px' }}>
            Sua conta atual possui o papel de <b>{user.role}</b>. O painel administrativo é reservado exclusivamente para o papel <b>admin</b>.
          </p>
          <Link href="/parceiro" className="button">
            Ir para a Área do Meu Estabelecimento
          </Link>
        </div>
      </main>
    );
  }

  const filteredEstablishments = establishments.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'todos' || place.publicationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const publishedCount = establishments.filter((e) => e.publicationStatus === 'published').length;
  const suspendedCount = establishments.filter((e) => e.publicationStatus === 'suspended').length;
  const activePaymentsCount = payments.filter((p) => p.status === 'active').length;

  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/parceiro" className="button ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
            Área do Parceiro
          </Link>
          <button
            onClick={handleLogout}
            style={{ background: 'transparent', border: '1px solid var(--border)', padding: '8px 14px', fontSize: 13 }}
          >
            Sair ({user?.name})
          </button>
        </div>
      </header>

      <section className="page-heading">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span className="badge">🛡️ Painel Master Admin</span>
          <span className="tag">Governança, Estabelecimentos e Pagamentos</span>
        </div>
        <h1>Administração Geral Noite DF</h1>
        <p>
          Acesso irrestrito a todos os estabelecimentos, pagamentos, suspensões/bloqueios, reembolsos e trilha de auditoria.
        </p>
      </section>

      {feedback && (
        <div
          className="notice"
          style={{
            borderColor: feedback.type === 'success' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(255, 77, 109, 0.4)',
            background: feedback.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 77, 109, 0.1)',
            color: feedback.type === 'success' ? '#4ade80' : '#ff9d9d',
            marginBottom: 24,
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Estatísticas Gerais */}
      <div className="metrics-grid" style={{ marginBottom: 32 }}>
        <article>
          <span>Total de Lugares</span>
          <strong>{establishments.length}</strong>
        </article>
        <article>
          <span>Publicados</span>
          <strong style={{ color: '#4ade80' }}>{publishedCount}</strong>
        </article>
        <article>
          <span>Bloqueados / Suspensos</span>
          <strong style={{ color: '#ff4d6d' }}>{suspendedCount}</strong>
        </article>
        <article>
          <span>Assinaturas Ativas</span>
          <strong>{activePaymentsCount}</strong>
        </article>
        <article>
          <span>Ações Auditadas</span>
          <strong>{auditLogs.length}</strong>
        </article>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab('establishments')}
          style={{
            background: activeTab === 'establishments' ? 'var(--accent)' : 'var(--card)',
            color: activeTab === 'establishments' ? '#111' : 'var(--text)',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          🏢 Estabelecimentos ({establishments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          style={{
            background: activeTab === 'payments' ? 'var(--accent)' : 'var(--card)',
            color: activeTab === 'payments' ? '#111' : 'var(--text)',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          💳 Pagamentos e Reembolsos ({payments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          style={{
            background: activeTab === 'audit' ? 'var(--accent)' : 'var(--card)',
            color: activeTab === 'audit' ? '#111' : 'var(--text)',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          📋 Auditoria e Últimos Acessos ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: Estabelecimentos */}
      {activeTab === 'establishments' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Buscar por nome ou região..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: 260 }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: 180 }}
            >
              <option value="todos">Todos os status</option>
              <option value="published">Apenas Publicados</option>
              <option value="suspended">Apenas Suspensos / Bloqueados</option>
              <option value="draft">Apenas Rascunhos</option>
            </select>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {filteredEstablishments.map((place) => (
              <div
                key={place.id}
                className="panel"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  padding: '18px 24px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{place.name}</h3>
                    <span
                      className="tag"
                      style={{
                        background:
                          place.publicationStatus === 'published'
                            ? 'rgba(74, 222, 128, 0.15)'
                            : place.publicationStatus === 'suspended'
                            ? 'rgba(255, 77, 109, 0.15)'
                            : 'rgba(255, 176, 32, 0.15)',
                        color:
                          place.publicationStatus === 'published'
                            ? '#4ade80'
                            : place.publicationStatus === 'suspended'
                            ? '#ff4d6d'
                            : 'var(--accent)',
                        fontSize: 12,
                      }}
                    >
                      {place.publicationStatus || 'published'}
                    </span>
                    <span className="tag" style={{ fontSize: 12 }}>{place.type}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                    {place.region} • {place.address} • Lotação: <b>{place.crowdStatus}</b> • Atualizado em: {place.lastUpdated}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Link
                    href={`/lugar/${place.id}`}
                    target="_blank"
                    className="button ghost"
                    style={{ padding: '8px 12px', fontSize: 12 }}
                  >
                    Ver Perfil
                  </Link>

                  {place.publicationStatus !== 'published' && (
                    <button
                      onClick={() => handleStatusChange(place.id, 'published')}
                      style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '8px 12px', fontSize: 12 }}
                    >
                      ✓ Publicar
                    </button>
                  )}

                  {place.publicationStatus !== 'draft' && place.publicationStatus !== 'suspended' && (
                    <button
                      onClick={() => handleStatusChange(place.id, 'draft')}
                      style={{ background: 'var(--card-2)', padding: '8px 12px', fontSize: 12 }}
                    >
                      Rascunho
                    </button>
                  )}

                  {place.publicationStatus !== 'suspended' ? (
                    <button
                      onClick={() => handleBlockEstablishment(place.id)}
                      style={{ background: 'rgba(255, 77, 109, 0.2)', color: '#ff9d9d', padding: '8px 12px', fontSize: 12 }}
                    >
                      🚫 Bloquear / Suspender
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(place.id, 'published')}
                      style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '8px 12px', fontSize: 12 }}
                    >
                      🔓 Desbloquear
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Pagamentos e Assinaturas */}
      {activeTab === 'payments' && (
        <div style={{ display: 'grid', gap: 14 }}>
          {payments.map((sub) => (
            <div
              key={sub.id}
              className="panel"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
                padding: '18px 24px',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{sub.establishmentName || sub.establishmentId}</h3>
                  <span className="badge" style={{ padding: '4px 8px', fontSize: 11 }}>
                    Plano {sub.planCode.toUpperCase()}
                  </span>
                  <span
                    className="tag"
                    style={{
                      background:
                        sub.status === 'active'
                          ? 'rgba(74, 222, 128, 0.15)'
                          : sub.status === 'refunded'
                          ? 'rgba(255, 77, 109, 0.15)'
                          : 'rgba(255, 176, 32, 0.15)',
                      color:
                        sub.status === 'active'
                          ? '#4ade80'
                          : sub.status === 'refunded'
                          ? '#ff4d6d'
                          : 'var(--accent)',
                      fontSize: 12,
                    }}
                  >
                    {sub.status === 'active' ? '● Ativo' : sub.status === 'refunded' ? '● Reembolsado' : '● Pendente'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                  Pagador: <b>{sub.payerEmail}</b> • Valor: <b>R$ {(sub.amountCents / 100).toFixed(2)}/mês</b> • ID: {sub.providerSubscriptionId}
                </p>
                {sub.refundedAt && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#ff9d9d' }}>
                    Reembolsado em {new Date(sub.refundedAt).toLocaleString('pt-BR')}: {sub.refundReason}
                  </p>
                )}
              </div>

              <div>
                {sub.status !== 'refunded' ? (
                  <button
                    onClick={() => handleRefund(sub.id)}
                    style={{ background: 'rgba(255, 77, 109, 0.2)', color: '#ff9d9d', padding: '10px 16px', fontSize: 13 }}
                  >
                    💸 Emitir Reembolso
                  </button>
                ) : (
                  <span className="tag" style={{ color: 'var(--muted)' }}>Reembolsado</span>
                )}
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="empty" style={{ textAlign: 'center', padding: 30 }}>
              Nenhuma assinatura cadastrada até o momento.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Auditoria e Últimos Acessos */}
      {activeTab === 'audit' && (
        <div className="panel" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: 16 }}>
            Trilha de Auditoria e Histórico de Acessos
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '170px 140px 1.5fr 1fr',
                  gap: 12,
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                }}
              >
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {new Date(log.createdAt).toLocaleString('pt-BR')}
                </div>
                <div>
                  <span className="tag" style={{ fontSize: 11 }}>
                    {log.action}
                  </span>
                </div>
                <div>
                  <b>{log.actorEmail || log.actorId || 'Sistema'}</b> ({log.actorRole || 'system'})
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)' }}>
                    Entidade: {log.entityType} ({log.entityId || 'geral'})
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.details ? JSON.stringify(log.details) : '—'}
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="empty" style={{ textAlign: 'center', padding: 20 }}>
                Nenhum evento registrado na auditoria ainda.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
