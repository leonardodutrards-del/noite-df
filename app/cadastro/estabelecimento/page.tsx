import Link from 'next/link';

export default function CadastroEstabelecimentoPage() {
  const onboarding = '/parceiro/onboarding';
  const signupUrl = `/cadastro/usuario?redirect=${encodeURIComponent(onboarding)}`;
  return (
    <main className="container account-page">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><nav><Link href="/cadastro">Trocar tipo de conta</Link><Link href="/login?redirect=%2Fparceiro%2Fonboarding">Já tenho conta</Link></nav></header>
      <section className="panel" style={{ maxWidth: 680, margin: '48px auto 90px', padding: 32 }}>
        <span className="badge">Área de estabelecimentos</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', margin: '12px 0' }}>Traga seu negócio para o Noite DF</h1>
        <p style={{ lineHeight: 1.7, color: 'var(--muted)' }}>Primeiro você cria uma conta pessoal de acesso. Depois, informa qual estabelecimento representa e envia uma solicitação de vínculo para análise da equipe Noite DF.</p>
        <div className="notice" style={{ margin: '22px 0', padding: 18 }}>
          <strong>Como funciona</strong>
          <ol style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}><li>Crie seu acesso com seu nome e e-mail.</li><li>Encontre seu estabelecimento ou envie os dados de um novo local.</li><li>Aguarde a análise e aprovação antes de gerenciar o perfil.</li></ol>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <Link className="button" href={signupUrl} style={{ textAlign: 'center' }}>Criar acesso e continuar</Link>
          <Link className="button ghost" href="/login?redirect=%2Fparceiro%2Fonboarding" style={{ textAlign: 'center' }}>Já tenho conta — solicitar gestão</Link>
        </div>
      </section>
    </main>
  );
}
