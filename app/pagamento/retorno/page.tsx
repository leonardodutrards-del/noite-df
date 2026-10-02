import Link from 'next/link';

export default function PaymentReturn() {
  return (
    <main className="container">
      <section className="page-heading">
        <span className="badge">Mercado Pago</span>
        <h1>Assinatura recebida</h1>
        <p>
          O Noite DF libera os benefícios somente depois da confirmação oficial do Mercado Pago pelo webhook.
          Em geral, basta voltar ao painel: assim que a assinatura aparecer como ativa, os recursos do plano ficam disponíveis automaticamente.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="button" href="/parceiro">Voltar ao painel</Link>
          <Link className="button ghost" href="/planos">Ver benefícios dos planos</Link>
        </div>
      </section>
    </main>
  );
}
