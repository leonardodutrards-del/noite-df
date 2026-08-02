import { places } from '@/data/places';

export function PartnerPreview() {
  const place = places.find((item) => item.id === 'rancho-do-vaqueiro-planaltina') ?? places[0];

  return (
    <section className="partner-layout">
      <div className="panel">
        <span className="badge">Área do estabelecimento</span>
        <h2>Painel para o dono atualizar a semana</h2>
        <p>
          No começo você atualiza manualmente. Quando crescer, cada bar, restaurante ou casa de show
          entra no próprio painel e altera agenda, promoção, lotação, horários, redes sociais e reservas.
        </p>
        <div className="admin-list">
          <div>✅ Editar fotos, descrição, Instagram, WhatsApp e cardápio</div>
          <div>✅ Publicar programação da semana</div>
          <div>✅ Informar promoção ativa e valor de entrada</div>
          <div>✅ Atualizar lotação: tranquilo, movimentado ou lotado</div>
          <div>✅ Receber dados de visualizações e cliques</div>
          <div>✅ Acompanhar notas por comida, bebida, música, segurança, atendimento e custo-benefício</div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="dashboard-header">
          <div>
            <small>Prévia do painel</small>
            <h3>{place.name}</h3>
          </div>
          <span className="tag">{place.ownerManaged ? 'Gerenciado' : 'Aguardando reivindicação'}</span>
        </div>

        <label>Lotação agora</label>
        <select defaultValue={place.crowdStatus}>
          <option value="tranquilo">🟢 tranquilo</option>
          <option value="movimentado">🟡 movimentado</option>
          <option value="lotado">🔴 lotado</option>
          <option value="a confirmar">⚪ a confirmar</option>
        </select>

        <label>Promoção / chamada de hoje</label>
        <input defaultValue={place.currentPromotion?.title ?? 'Ex: Chopp em dobro até 21h'} />

        <label>Agenda da semana</label>
        <textarea defaultValue={place.weeklySchedule.map((item) => `${item.day} — ${item.title} — ${item.time}`).join('\n')} />

        <label>Responder avaliação recente</label>
        <textarea defaultValue="Obrigado pela avaliação! Estamos melhorando atendimento, estrutura e programação da semana." />

        <button>Salvar alterações da semana</button>
      </div>
    </section>
  );
}
