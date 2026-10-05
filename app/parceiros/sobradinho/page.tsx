import type { Metadata } from 'next';
import Link from 'next/link';
import { places } from '@/data/places';
import { PLAN_CATALOG, formatMoney } from '@/lib/plans';

export const metadata: Metadata = {
  title: 'Noite DF para estabelecimentos de Sobradinho',
  description: 'Agenda, perfil, promoções, métricas e presença digital para bares, restaurantes e casas de eventos de Sobradinho.',
};

const paidPlans = [PLAN_CATALOG.pro, PLAN_CATALOG.premium, PLAN_CATALOG.enterprise];

export default function SobradinhoPartnersPage() {
  const localPlaces = places
    .filter((place) => place.region === 'Sobradinho')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const showcaseIds = new Set([
    'palorama-sobradinho-i',
    'oito-gastrobar',
    'porks-sobradinho',
    'chopp-brasilia-bier',
    'p10-gastrobar',
    'eita-lounge-bar',
  ]);
  const showcase = localPlaces.filter((place) => showcaseIds.has(place.id));

  return (
    <main className="container">
      <header className="topbar sales-topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/planos">Planos</Link>
          <Link href="/login?redirect=/parceiro">Entrar como parceiro</Link>
        </nav>
      </header>

      <section className="hero" style={{ alignItems: 'center', marginTop: 24 }}>
        <div>
          <span className="badge">Sobradinho · operação local</span>
          <h1>Transforme sua programação em descoberta, contato e cliente.</h1>
          <p style={{ fontSize: 18 }}>
            O Noite DF reúne bares, restaurantes e eventos em um guia regional e dá ao estabelecimento
            um painel para manter agenda, promoções, contato e métricas atualizados.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <Link className="button" href="/cadastro">Quero ativar meu estabelecimento</Link>
            <Link className="button ghost" href="/planos">Ver planos</Link>
          </div>
        </div>
        <div className="panel">
          <span className="badge">Sobradinho no Noite DF</span>
          <div className="metrics-grid" style={{ marginTop: 16 }}>
            <article><span>Estabelecimentos mapeados</span><strong>{localPlaces.length}</strong></article>
            <article><span>Perfil público</span><strong>24h</strong></article>
            <article><span>Agenda e promoções</span><strong>Direto</strong></article>
            <article><span>Métricas</span><strong>30 dias</strong></article>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        <span className="badge">O que o dono ganha</span>
        <h2>Uma presença local que ele mesmo consegue operar</h2>
        <div className="grid" style={{ marginTop: 18 }}>
          <article className="card">
            <h3>📍 Perfil completo</h3>
            <p>Endereço, rota, WhatsApp, Instagram, descrição e informações úteis em uma página compartilhável.</p>
          </article>
          <article className="card">
            <h3>📅 Agenda atualizada</h3>
            <p>Shows, música ao vivo, programação semanal e eventos especiais podem ser mantidos pelo próprio parceiro.</p>
          </article>
          <article className="card">
            <h3>🔥 Promoções e lotação</h3>
            <p>Destaque chopp em dobro, entrada, happy hour e movimento do local para quem está decidindo onde ir.</p>
          </article>
          <article className="card">
            <h3>📊 Métricas reais</h3>
            <p>Visualizações, cliques no WhatsApp, rotas, Instagram e favoritos ajudam a medir a procura pelo estabelecimento.</p>
          </article>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 36 }}>
        <span className="badge">Ativação na reunião</span>
        <h2>Começar leva poucos minutos</h2>
        <div className="grid" style={{ marginTop: 16 }}>
          <article className="card">
            <strong>1.</strong>
            <h3>Crie a conta</h3>
            <p>O dono usa o próprio e-mail para criar uma conta segura no Noite DF.</p>
          </article>
          <article className="card">
            <strong>2.</strong>
            <h3>Vincule o estabelecimento</h3>
            <p>O Master Admin confirma presencialmente o vínculo com o local.</p>
          </article>
          <article className="card">
            <strong>3.</strong>
            <h3>Escolha o plano</h3>
            <p>O parceiro escolhe o plano e conclui a autorização de cobrança no Mercado Pago.</p>
          </article>
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        <span className="badge">Planos para começar</span>
        <h2>Preço simples, mensal e recorrente</h2>
        <div className="pricing-grid" style={{ marginTop: 18 }}>
          {paidPlans.map((plan) => (
            <article className="price-card" key={plan.id}>
              <span>{plan.name}</span>
              <h2>{formatMoney(plan.priceCents)}<small>/mês</small></h2>
              <p>{plan.description}</p>
              <ul className="feature-list">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <Link className="button" href={`/planos?plan=${plan.id}`}>Escolher {plan.name}</Link>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 36 }}>
        <span className="badge">Já no circuito local</span>
        <h2>Exemplos em Sobradinho</h2>
        <p>
          O catálogo regional já inclui estabelecimentos que você pode abrir durante a apresentação para mostrar como a ficha pública funciona.
        </p>
        <div className="grid" style={{ marginTop: 18 }}>
          {showcase.map((place) => (
            <article className="card" key={place.id}>
              <h3>{place.name}</h3>
              <p>{place.address}</p>
              <Link className="button ghost" href={`/lugar/${place.id}`} target="_blank">Abrir perfil</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 36, marginBottom: 48, textAlign: 'center' }}>
        <span className="badge">Pronto para ativar</span>
        <h2>Seu estabelecimento pode sair da reunião com o painel liberado.</h2>
        <p>
          Crie a conta, confirme o vínculo presencialmente e escolha o plano. Os dados do estabelecimento continuam salvos mesmo se a assinatura for cancelada.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="button" href="/cadastro">Criar conta agora</Link>
          <Link className="button ghost" href="/planos">Comparar planos</Link>
        </div>
      </section>
    </main>
  );
}
