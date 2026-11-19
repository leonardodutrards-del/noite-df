import type { Metadata } from 'next';
import Link from 'next/link';
import { PLAN_CATALOG } from '@/lib/plans';
import { SHOWCASE_MODE, PAYMENTS_ENABLED } from '@/lib/env';
import { PlanList } from '@/components/PlanList';

export const metadata: Metadata = {
  title: 'Planos para estabelecimentos | Noite DF',
  description: 'Conheça os planos do Noite DF para gerenciar perfil, agenda, promoções e acompanhar o interesse do público.',
  alternates: { canonical: '/planos' },
};

export default function PlansPage() {
  const plans = Object.values(PLAN_CATALOG);
  return (
    <main className="container">
      <header className="topbar sales-topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/agenda-semanal">Agenda semanal</Link>
          <Link href="/sobre">Sobre e contato</Link>
          <Link href="/login">Entrar</Link>
        </nav>
      </header>

      <section className="page-heading">
        <span className="badge">Soluções para estabelecimentos</span>
        <h1>Escolha o plano ideal para sua operação</h1>
        <p>Gerencie a presença do seu estabelecimento no Noite DF, mantenha sua programação atualizada e acompanhe o interesse do público. Compare os recursos e escolha o nível de autonomia adequado à sua equipe.</p>
      </section>

      <section className="notice" style={{ marginBottom: 24 }}>
        <b>Comece no seu ritmo.</b> O plano Gratuito permite conhecer o painel. Os planos pagos ampliam os recursos de gestão e análise. Nenhum pagamento é iniciado antes da autenticação e da confirmação do vínculo com o estabelecimento.
      </section>

      <PlanList plans={plans} paymentsEnabled={PAYMENTS_ENABLED} showcaseMode={SHOWCASE_MODE} trialEnabled={false} trialDays={0} />

      <section className="panel" style={{ marginTop: 28 }}>
        <h2>Como contratar</h2>
        <p>1. Entre ou crie sua conta. 2. Solicite o vínculo com seu estabelecimento. 3. Após a aprovação, escolha o plano. 4. Para planos pagos, conclua o checkout seguro do Mercado Pago.</p>
        <p>A ativação dos recursos pagos depende da confirmação do pagamento pelo provedor. No Pix, o acesso é liberado por 30 dias após a aprovação e a renovação é manual. Na assinatura recorrente, você autoriza a renovação no checkout e pode cancelar pelo painel.</p>
      </section>

      {SHOWCASE_MODE ? <section className="notice" style={{ marginTop: 20 }}><b>Ambiente de demonstração:</b> os pagamentos estão temporariamente indisponíveis.</section> : null}

      <footer className="footer"><Link href="/">Voltar ao guia</Link> · <Link href="/termos">Termos</Link> · <Link href="/privacidade">Privacidade</Link></footer>
    </main>
  );
}
