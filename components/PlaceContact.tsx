import type { Establishment } from '@/modules/establishments/types';

export function PlaceContact({ place, compact = false }: { place: Establishment; compact?: boolean }) {
  const contact = place.businessContact;
  const digits = contact?.phone.replace(/\D/g, '');
  const validPhone = digits && /^\d{10,11}$/.test(digits);
  const whatsapp = contact?.whatsapp?.replace(/\D/g, '');
  const validWhatsapp = whatsapp && /^\d{10,11}$/.test(whatsapp);
  const phoneLabel = validPhone ? `(${digits.slice(0, 2)}) ${digits.slice(2, -4)}-${digits.slice(-4)}` : '';
  const agendaUrl = place.agendaUrl ?? place.instagram;

  return (
    <section className="place-contact" aria-label={`Contato de ${place.name}`}>
      {validPhone && <a className="button ghost" href={`tel:+55${digits}`}>Ligar {phoneLabel}</a>}
      {validWhatsapp && <a className="button ghost" href={`https://wa.me/55${whatsapp}`} target="_blank" rel="noreferrer">Contato pelo WhatsApp ↗</a>}
      {!compact && <>
        {place.menu && <div className="contact-section">
          <h2>Cardápio e preços</h2>
          {place.menu.examples?.map(item => <p key={item.name}>
            {item.name}: <strong>{item.from ? 'a partir de ' : ''}{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>{item.note ? ` · ${item.note}` : ''}
          </p>)}
          <p className="field-hint">Preços consultados em {place.menu.checkedAt}. Confirme disponibilidade, taxas e valores atualizados no cardápio.</p>
          <a href={place.menu.url} target="_blank" rel="noreferrer">Abrir cardápio do estabelecimento ↗</a>
        </div>}
        {place.admissionNote && <div className="contact-section"><h2>Entrada e couvert</h2><p>{place.admissionNote}</p>{place.menu && <a href={place.menu.url} target="_blank" rel="noreferrer">Consultar condições no cardápio ↗</a>}</div>}
        {contact && <p className="field-hint">Contato consultado em fonte pública. <a href={contact.sourceUrl} target="_blank" rel="noreferrer">Ver fonte</a> · Consultado em {contact.checkedAt}.</p>}
        {place.operatingHours && <div className="contact-section"><h2>Horários de funcionamento</h2><p>{place.operatingHours.text}</p><a href={place.operatingHours.sourceUrl} target="_blank" rel="noreferrer">Consultar horários na fonte ↗</a></div>}
        {agendaUrl && <div className="contact-section"><h2>Agenda da semana</h2><p>Confira a programação mais recente e confirme data, horário e reservas diretamente com o local.</p><a href={agendaUrl} target="_blank" rel="noreferrer">Consultar programação no canal do local ↗</a></div>}
      </>}
    </section>
  );
}
