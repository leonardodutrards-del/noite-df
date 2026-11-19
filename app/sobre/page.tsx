import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre o Noite DF e seu fundador',
  description: 'Conheça o Noite DF, sua proposta e seu fundador.',
};

export default function AboutPage() {
  return (
    <main className="container legal">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav><Link href="/planos">Planos para estabelecimentos</Link></nav>
      </header>
      <span className="badge">Quem está por trás</span>
      <h1>Leonardo Dutra</h1>
      <p>Fundador do Noite DF · Brasília/DF</p>
      <h2>Uma ideia local, com visão de produto</h2>
      <p>O Noite DF foi criado para facilitar a descoberta de bares, restaurantes, eventos e experiências no Distrito Federal e Entorno. A proposta é reunir informações locais em uma experiência simples, organizada e útil para quem procura o que fazer e para estabelecimentos que desejam fortalecer sua presença digital.</p>
      <h2>Atuação no projeto</h2>
      <ul>
        <li>Concepção e evolução do produto digital.</li>
        <li>Organização do guia, dos estabelecimentos e da programação local.</li>
        <li>Relacionamento com estabelecimentos e parceiros.</li>
        <li>Acompanhamento de tecnologia, experiência do usuário e operação.</li>
      </ul>
      <h2>Contato institucional</h2>
      <p>Para assuntos comerciais, parcerias e informações sobre o projeto, consulte os canais oficiais apresentados no site.</p>
      <p><Link href="/planos">Conheça os planos para estabelecimentos</Link></p>
      <footer className="footer"><Link href="/">Voltar ao Noite DF</Link></footer>
    </main>
  );
}
