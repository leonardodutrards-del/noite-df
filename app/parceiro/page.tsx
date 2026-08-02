import Link from 'next/link';

const metrics = [['Visualizações', '12.430'], ['Cliques no WhatsApp', '312'], ['Rotas abertas', '870'], ['Favoritos', '530'], ['Conversão estimada', '6,8%']];

export default function PartnerPage() {
  return <main className="container"><header className="topbar"><Link className="brand" href="/">Noite DF</Link><Link href="/planos">Planos</Link></header><section className="page-heading"><span className="badge">Painel demonstrativo</span><h1>Visibilidade do estabelecimento</h1><p>Os dados abaixo são demonstrativos até o banco de interações e a autenticação serem ligados.</p></section><div className="metrics-grid">{metrics.map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><section className="two-columns"><div className="panel"><h2>Agenda da semana</h2><p>Segunda: fechado</p><p>Quarta: música ao vivo</p><p>Sexta: promoção e evento especial</p><button>Editar agenda</button></div><div className="panel"><h2>Qualidade da página</h2><p>Complete horários, fotos, cardápio, acessibilidade e fonte oficial para aumentar a confiança.</p><progress value="68" max="100">68%</progress><p>68% completo</p></div></section><section className="notice"><b>Próxima etapa operacional:</b> autenticação, reivindicação de página, persistência dos eventos de analytics e aprovação administrativa.</section></main>;
}
