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
  'quintal-tia-sandra': { businessContact: contact('61996426143', 'https://quintaldatiasandra.com.br/', '61996426143'), agendaUrl: 'https://quintaldatiasandra.com.br/programacao/' },
  'na-banca-sobradinho': { businessContact: contact('61994426002', 'https://acuolina.com/pt/na-banca') },
  'savassi-valparaiso': { businessContact: contact('6136294244', 'https://savassicarnedesol.com.br/') },
  'savassi-guara': { businessContact: contact('6133822534', 'https://savassicarnedesol.com.br/', '6133822534') },
  'sauz-guara': { businessContact: contact('6135267126', 'https://www.sauz.com.br/', '6135267126') },
  'fausto-manoel-pontao': { businessContact: contact('6132977013', 'https://www.pontao.com.br/restaurantes/fausto--manoel/') },
  'gran-bier-pontao': { businessContact: contact('6133644041', 'https://www.pontao.com.br/restaurantes/gran-bier/') },
  'sallva-pontao': { businessContact: contact('6135224352', 'https://www.pontao.com.br/restaurantes/sallva-bar--ristorante/') },
  'soho-pontao': { businessContact: contact('6133643979', 'https://www.pontao.com.br/restaurantes/soho/') },
  'wine-garden-pontao': { businessContact: contact('61992115375', 'https://www.pontao.com.br/restaurantes/wine-garden/', '61992115375') },
  'chard-pontao': { businessContact: contact('6132631286', 'https://www.pontao.com.br/restaurantes/chard-by-chicago-prime/', '6132631286') },
  'cafe-chero-pontao': { businessContact: contact('61999940886', 'https://www.pontao.com.br/restaurantes/cafe-e-um-chero/') },
  'bar-stilo-10': { businessContact: contact('61982659565', 'https://www.instagram.com/barstilo10/'), agendaUrl: 'https://www.instagram.com/barstilo10/' },
  'brasileirinho-bar-e-restaurante': { businessContact: contact('61981952692', 'https://www.instagram.com/brasileirinhoqd08/reel/DZbcfIZOecK/'), agendaUrl: 'https://www.instagram.com/brasileirinhoqd08/' },
  'galpao-zero-8': { businessContact: contact('6133020235', 'https://wa.me/message/7T2REXXVZRQGB1', '6133020235'), agendaUrl: 'https://www.instagram.com/galpao.zero8/' },
  'clube-aqua': { businessContact: contact('6130841662', 'https://www.instagram.com/aquaplays1/'), agendaUrl: 'https://www.instagram.com/aquaplays1/' },
  'olinda-bar-e-restaurante': { businessContact: contact('61996222718', 'https://linktr.ee/olindaoficial1', '61996222718'), agendaUrl: 'https://linktr.ee/olindaoficial1' },
  'shot-rock-bar': { businessContact: contact('6135410182', 'https://comidadibuteco.com.br/buteco/shot-rock-bar/') },
  'panca-cheia': { businessContact: contact('61996693282', 'https://comidadibuteco.com.br/buteco/panca-cheia-2/') },
  'porks-sobradinho': { businessContact: contact('61935003917', 'https://sobradinhoporks.com.br/'), agendaUrl: 'https://sobradinhoporks.com.br/#agenda', operatingHours: hours('Terça a sexta: abertura às 17h. Sábado e domingo: abertura às 16h. Confirme o encerramento e horários especiais com o local.', 'https://sobradinhoporks.com.br/') },
  'trends-pub': { agendaUrl: 'https://www.trendsrockbar.com.br/ingressos' },
  'clube-27-bar': { operatingHours: hours('Terça a sábado: abertura às 17h. Domingo: abertura às 15h30. Horário de encerramento não informado no perfil.', 'https://www.instagram.com/clube27bar/') },
  'bar-do-assis': { operatingHours: hours('Abertura todos os dias às 9h. Confirme o horário de encerramento com o local.', 'https://www.instagram.com/bar.assis/') },
  'contexto-bar': { businessContact: contact('61982071690', 'https://linktr.ee/contexto_bar', '61982071690'), instagram: 'https://www.instagram.com/contextobar/', agendaUrl: 'https://linktr.ee/contexto_bar' },
  'oscarito-brasilia': { businessContact: contact('61998208438', 'https://curt.link/oscarito', '61998208438'), instagram: 'https://www.instagram.com/oscaritobrasilia/', agendaUrl: 'https://www.sympla.com.br/produtor/oscaritobrasilia' },
  'complexo-fora-do-eixo': { businessContact: contact('61999904020', 'https://linktr.ee/foradoeixocpx', '61999904020'), instagram: 'https://www.instagram.com/complexoforadoeixo/', agendaUrl: 'https://linktr.ee/foradoeixocpx' },
  'galpao-dos-brutos': { businessContact: contact('6195803647', 'https://wa.me/message/AKZ6ZRECYGTNN1', '6195803647'), instagram: 'https://www.instagram.com/osbrutosdopiseiro1/', agendaUrl: 'https://www.instagram.com/osbrutosdopiseiro1/' },
  'rancho-do-vaqueiro': { businessContact: contact('61993767575', 'https://www.instagram.com/ranchodovaqueirobsb/', '61993767575'), instagram: 'https://www.instagram.com/ranchodovaqueirobsb/', address: 'DF-345, km 18, Parque Maria Luiza — Planaltina, DF, 73370-100', mapsQuery: 'Rancho do Vaqueiro DF-345 km 18 Parque Maria Luiza Planaltina DF', agendaUrl: 'https://www.instagram.com/ranchodovaqueirobsb/', lastUpdated: '2026-09-16' },
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
