import type { Establishment } from '@/modules/establishments/types';

const contact = (phone: string, sourceUrl: string, whatsapp?: string): Establishment['businessContact'] => ({
  phone, whatsapp, sourceUrl, checkedAt: '2026-09-16',
});
const hours = (text: string, sourceUrl: string): Establishment['operatingHours'] => ({ text, sourceUrl, checkedAt: '2026-09-16' });
const alfredo = 'https://www.alfredospizzaria.com.br/';
const xique = 'https://www.restaurantexiquexique.com.br/';
const figueiredo = 'https://linktr.ee/figueiredocozinhaebar';
const figueiredoInstagram = 'https://www.instagram.com/figueiredocozinhaebar/';

export const contactUpdates: Record<string, Partial<Establishment>> = {
  'alfredos-pizzaria-asa-norte': { businessContact: contact('6139673968', alfredo), operatingHours: hours('Segunda a sábado: 17h30 à meia-noite. Domingo: 17h30 às 22h.', alfredo), agendaUrl: alfredo },
  'alfredos-pizzaria-asa-sul': { businessContact: contact('61994309363', alfredo, '61994309363'), operatingHours: hours('Terça a sexta: 17h30 às 23h. Sábado: 12h às 23h. Domingo: 12h às 22h. Segunda: não informada na fonte.', alfredo), agendaUrl: alfredo },
  'xique-xique-asa-norte': { businessContact: contact('6132742810', xique), operatingHours: hours('Todos os dias: 11h às 23h.', xique), agendaUrl: xique },
  'xique-xique-asa-sul': { businessContact: contact('6132445797', xique), operatingHours: hours('Todos os dias: 11h às 23h.', xique), agendaUrl: xique },
  'figueiredo-cozinha-e-bar-planaltina': { businessContact: contact('61998738835', figueiredo, '61998738835'), instagram: figueiredoInstagram, operatingHours: hours('Todos os dias: 11h à meia-noite, conforme a biografia da marca. Confirme exceções com a unidade.', figueiredoInstagram), agendaUrl: figueiredoInstagram },
  'figueiredo-cozinha-e-bar': { businessContact: contact('61999294322', figueiredo, '61999294322'), operatingHours: hours('Todos os dias: 11h à meia-noite, conforme a biografia da marca. Confirme exceções com a unidade.', figueiredoInstagram), agendaUrl: figueiredoInstagram },
  'meatz-burger-sudoeste': { businessContact: contact('61936181537', 'https://deliverydireto.com.br/meatzburger/sudoeste/pages/contato', '61936181537'), agendaUrl: 'https://deliverydireto.com.br/meatzburger/sudoeste/pages/sobre-nos' },
  'ticiana-werner-wine-bar': { businessContact: contact('6132269947', 'https://www.ticianawerner.com.br/contato.php', '61982636847') },
  'dudu-bar': { businessContact: contact('6130486001', 'https://dudubar.com.br/'), operatingHours: hours('Segunda a quinta: 12h às 15h e 18h à meia-noite. Sexta e sábado: 12h à 1h30. Domingo: 12h às 17h.', 'https://dudubar.com.br/'), agendaUrl: 'https://dudubar.com.br/' },
  'infinu-comunidade-criativa': { businessContact: contact('61994086787', 'https://www.infinu.com.br/', '61994086787'), agendaUrl: 'https://www.infinu.com.br/' },
  'mormaii-surf-bar': { businessContact: contact('6132481265', 'https://www.pontao.com.br/restaurantes/mormaii-surf-bar/'), agendaUrl: 'https://www.pontao.com.br/restaurantes/mormaii-surf-bar/' },
  'pontao-do-lago-sul': { businessContact: contact('6133640580', 'https://www.pontao.com.br/restaurantes/mormaii-surf-bar/'), operatingHours: hours('Domingo a quinta: 7h à meia-noite. Sexta e sábado: 7h à 1h. Cada estabelecimento tem seu próprio horário.', 'https://www.pontao.com.br/restaurantes/mormaii-surf-bar/') },
};

export function enrichContact(place: Establishment): Establishment {
  return { ...place, ...contactUpdates[place.id] };
}
