import Link from 'next/link';

export default function CadastroPage() {
  return (
    <main className="container account-page">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/">Explorar</Link><Link href="/login">Entrar</Link></nav>
      </header>
      <section className="page-heading" style={{ maxWidth: 760, margin: '54px auto 28px', textAlign: 'center' }}>
        <span className="badge">Faça parte do Noite DF</span>
        <h1>Como você quer usar a plataforma?</h1>
        <p>Escolha o tipo de conta para acessar a experiência certa desde o começo.</p>
      </section>
      <section className="grid" style={{ maxWidth: 900, margin: '0 auto 80px', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
        <article className="panel account-panel" style={{ padding: 28 }}>
          <span className="badge">Para o público</span>
          <h2>Quero descobrir a cidade</h2>
          <p>Explore bares, acompanhe a programação, favorite lugares e salve eventos para não perder nada.</p>
          <ul><li>Favoritos de bares e eventos</li><li>Agenda e programação semanal</li><li>Preferências e roteiros pessoais</li></ul>
          <Link className="button" href="/cadastro/usuario" style={{ display: 'inline-flex', marginTop: 12 }}>Criar conta de usuário</Link>
        </article>
        <article className="panel account-panel" style={{ padding: 28 }}>
          <span className="badge">Para estabelecimentos</span>
          <h2>Quero divulgar meu negócio</h2>
          <p>Solicite a gestão do perfil do seu bar, restaurante, pub ou casa de eventos e acompanhe sua presença no Noite DF.</p>
          <ul><li>Solicitar vínculo com local publicado</li><li>Gerenciar perfil após aprovação</li><li>Divulgar agenda e promoções</li></ul>
          <Link className="button" href="/cadastro/estabelecimento" style={{ display: 'inline-flex', marginTop: 12 }}>Criar conta de estabelecimento</Link>
        </article>
      </section>
    </main>
  );
}
