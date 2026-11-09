import Link from 'next/link';

export default function CadastroEstabelecimentoPage() {
  return (
    <main className="container account-page">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><nav><Link href="/cadastro">Tipos de conta</Link><Link href="/login">Entrar</Link></nav></header>
      <section className="panel account-panel" style={{ maxWidth: 680, margin: '54px auto 80px', padding: 32 }}>
        <span className="badge">Área de parceiros</span>
        <h1>Conta de estabelecimento</h1>
        <p>Este acesso é para proprietários e responsáveis por bares, restaurantes, pubs e casas de eventos.</p>
        <h3>Como funciona</h3>
        <ol>
          <li>Crie seu acesso com os dados do responsável.</li>
          <li>Depois, solicite a gestão do estabelecimento existente ou envie os dados para análise.</li>
          <li>O acesso ao painel de parceiro é liberado após validação e aprovação.</li>
        </ol>
        <div className="notice" style={{ margin: '20px 0' }}>A criação da conta não concede automaticamente acesso de parceiro. Isso protege os perfis e os dados dos estabelecimentos.</div>
        <Link className="button" href="/cadastro/usuario?tipo=estabelecimento">Continuar como responsável</Link>
        <p style={{ marginTop: 18 }}><Link href="/cadastro">Voltar e escolher outro tipo de conta</Link></p>
      </section>
    </main>
  );
}
