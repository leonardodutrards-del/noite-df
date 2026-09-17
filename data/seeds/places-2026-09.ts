import type { Establishment } from '@/modules/establishments/types';

// Identity and address checked against the linked business sources.
// Unknown prices, ratings, music and live occupancy are deliberately not inferred.
const record = (id: string, name: string, region: string, address: string,
  description: string, url: string, vibe: string[]): Establishment => ({
  id, name, region, address, description, type: 'Restaurante', vibe,
  music: [], audience: [], mapsQuery: `${name} ${address}`,
  verified: false, ownerManaged: false, crowdStatus: 'a confirmar',
  weeklySchedule: [], lastUpdated: '2026-09-16', publicationStatus: 'published',
  source: { kind: 'official', label: 'Informações publicadas pelo estabelecimento', url, verifiedAt: '2026-09-16' },
  publicRatings: [],
});

export const additionalPlaces: Establishment[] = [
  record('meatz-burger-sudoeste', 'Meatz Burger — Sudoeste', 'Sudoeste',
    'CLSW 101, Bloco A, Entrada 40 — Sudoeste, Brasília, DF, 70670-501',
    'Hamburgueria no Sudoeste com pedidos para entrega e retirada. Consulte a unidade sobre atendimento no salão.',
    'https://deliverydireto.com.br/meatzburger/sudoeste/pages/sobre-nos', ['hambúrgueres']),
  record('figueiredo-cozinha-e-bar-planaltina', 'Figueiredo Cozinha e Bar — Planaltina', 'Planaltina',
    'Quadra 02, Bloco F, Loja 01 — Planaltina, Brasília, DF, 73310-316',
    'Unidade de Planaltina do Figueiredo Cozinha e Bar, com cardápio e canal de reservas divulgados na página oficial da marca.',
    'https://linktr.ee/figueiredocozinhaebar', ['gastronomia']),
  record('xique-xique-asa-norte', 'Xique Xique — Asa Norte', 'Asa Norte',
    'SHCN 708, Bloco E, Loja 45 — Asa Norte, Brasília, DF',
    'Restaurante de culinária nordestina com carne de sol. O site informa funcionamento diário das 11h às 23h; confirme horários especiais com a unidade.',
    'https://www.restaurantexiquexique.com.br/', ['comida regional', 'nordestino']),
  record('xique-xique-asa-sul', 'Xique Xique — Asa Sul', 'Asa Sul',
    'Quadra 107 Sul, Bloco E 2 — Asa Sul, Brasília, DF',
    'Unidade da Asa Sul dedicada à culinária nordestina. O site informa funcionamento diário das 11h às 23h; confirme horários especiais com a unidade.',
    'https://www.restaurantexiquexique.com.br/', ['comida regional', 'nordestino']),
  record('alfredos-pizzaria-asa-norte', "Alfredo’s Pizzaria — Asa Norte", 'Asa Norte',
    'CLN 408, Bloco C, Loja 10 — Asa Norte, Brasília, DF',
    'Pizzaria com forno a lenha na 408 Norte. Consulte o site oficial para cardápio, pedidos e horários da unidade.',
    'https://www.alfredospizzaria.com.br/', ['pizza']),
  record('alfredos-pizzaria-asa-sul', "Alfredo’s Pizzaria — Asa Sul", 'Asa Sul',
    'CLS 506, Bloco A, Loja 67, Infinu — Asa Sul, Brasília, DF',
    'Pizzaria com forno a lenha dentro do Infinu, na 506 Sul. É uma operação própria dentro do espaço cultural.',
    'https://www.alfredospizzaria.com.br/', ['pizza']),
];
