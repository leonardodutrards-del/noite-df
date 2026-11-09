import Link from 'next/link';

export default function CadastroPage() {
  return (
    <main className="container account-page">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><nav><Link href="/">Explorar programação</Link><Link href="/login">Já tenho conta</Link></nav></header>
      <section style={{ maxWidth: 900, margin: '52px auto 90px' }}>
        <span className="badge">Crie sua conta</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', margin: '12px 0' }}>Como você quer usar o Noite DF?</h1>
        <p style={{ maxWidth: 650, lineHeight: 1.7, color: 'var(--muted)' }}>Escolha seu perfil. Cada tipo de conta tem uma experiência própria.</p>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 20, marginTop: 30 }}>
          <article className="panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span className="badge">Para curtir e descobrir</span><h2 style={{ margin: 0 }}>Quero explorar</h2>
            <p style={{ lineHeight: 1.65, color: 'var(--muted)' }}>Salve estabelecimentos, acompanhe a programação e organize suas próximas saídas.</p>
            <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}><li>Salvar estabelecimentos</li><li>Acompanhar a programação</li><li>Organizar suas próximas saídas</li></ul>
            <Link className="button" href="/cadastro/usuario" style={{ textAlign: 'center', marginTop: 'auto' }}>Criar conta de usuário</Link>
          </article>
          <article className="panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span className="badge">Para negócios e produtores</span><h2 style={{ margin: 0 }}>Represento um estabelecimento</h2>
            <p style={{ lineHeight: 1.65, color: 'var(--muted)' }}>Solicite o vínculo com um bar, restaurante ou casa de eventos e, após aprovação, gerencie o perfil e a programação.</p>
            <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}><li>Solicitar gestão de um perfil existente</li><li>Enviar um novo local para análise</li><li>Gerenciar agenda após aprovação</li></ul>
            <Link className="button ghost" href="/cadastro/estabelecimento" style={{ textAlign: 'center', marginTop: 'auto' }}>Criar acesso de estabelecimento</Link>
          </article>
        </div>
        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14 }}>Só quer olhar a programação? <Link href="/" style={{ color: 'var(--accent)' }}>Explore sem criar conta.</Link></p>
      </section>
    </main>
  );
}
