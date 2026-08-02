const responsibilities = [
  'Revisar estabelecimentos, eventos e promoções antes da publicação.',
  'Validar reivindicações feitas pelos responsáveis dos estabelecimentos.',
  'Expirar informações antigas e registrar a fonte e a última verificação.',
  'Analisar denúncias, moderar conteúdo e manter a trilha de auditoria.',
];

export default function AdminPage() {
  return (
    <main className="container">
      <section className="hero">
        <div>
          <span className="badge">Estrutura inicial — acesso ainda não autenticado</span>
          <h1>Painel administrativo</h1>
          <p>Área reservada ao operador responsável pela confiança e qualidade dos dados publicados no Noite DF.</p>
        </div>
      </section>
      <section className="panel">
        <h2>Fluxo de curadoria</h2>
        {responsibilities.map((item) => <p key={item}>✓ {item}</p>)}
      </section>
    </main>
  );
}
