import type { Establishment } from '@/modules/establishments/types';

// Linked by the venues' own websites; prices are snapshots, not quotations.
export const menuUpdates: Record<string, Establishment['menu']> = {
  'quintal-tia-sandra': {
    url: 'https://www.vucafood.com.br/grupoabencoado/2062/cardapio-digital',
    checkedAt: '2026-09-17',
    examples: [
      { name: 'Strogonoff de frango', price: 39.99 },
      { name: 'Salada Caesar com frango', price: 34.99 },
      { name: 'Chapa de picanha gaúcha 600 g', price: 189.99, note: 'Serve de 3 a 4 pessoas, conforme o cardápio' },
    ],
  },
  'ticiana-werner-wine-bar': {
    url: 'https://livemenu.app/menu/66cf6efb3f9d6b50780e1d09',
    checkedAt: '2026-09-17',
  },
  'meatz-burger-sudoeste': {
    url: 'https://deliverydireto.com.br/meatzburger/sudoeste',
    checkedAt: '2026-09-17',
    examples: [
      { name: 'Combo Classic (burger, batata e bebida)', price: 48, from: true, note: 'Preço do pedido online; pode variar conforme adicionais' },
      { name: 'Combo Salad (burger, batata e bebida)', price: 53, from: true, note: 'Preço do pedido online; pode variar conforme adicionais' },
    ],
  },
  'alfredos-pizzaria-asa-norte': { url: 'https://www.alfredospizzaria.com.br/_files/ugd/9b4045_3f94f3524cd24357bf762bf6eea865ad.pdf', checkedAt: '2026-09-17' },
  'alfredos-pizzaria-asa-sul': { url: 'https://www.alfredospizzaria.com.br/_files/ugd/9b4045_59fd06f5e6d644d88d7fa5b7ce0ab187.pdf', checkedAt: '2026-09-17' },
  'xique-xique-asa-norte': { url: 'https://www.restaurantexiquexique.com.br/#cardapio', checkedAt: '2026-09-17' },
  'xique-xique-asa-sul': { url: 'https://www.restaurantexiquexique.com.br/#cardapio', checkedAt: '2026-09-17' },
  'sauz-guara': {
    url: 'https://www.vucafood.com.br/sauzrestaurante/784/cardapio-digital',
    checkedAt: '2026-09-17',
    examples: [
      { name: 'Sauz Steak', price: 81.90 },
      { name: 'Risoto de cogumelos', price: 57.90 },
      { name: 'Suco de laranja', price: 11.90 },
    ],
  },
  'na-banca-sobradinho': {
    url: 'https://acuolina.com/pt/na-banca',
    checkedAt: '2026-09-17',
    examples: [
      { name: 'Ceviche de tilápia', price: 39 },
      { name: 'Carne de sol Angus', price: 119, note: '400 g, dois acompanhamentos, para duas pessoas' },
      { name: 'Bife à cavalo executivo', price: 38, note: 'Terça a sexta até 15h, exceto feriados' },
    ],
  },
  'savassi-guara': {
    url: 'https://savassicarnedesolguara.saipos.com/savassi-carne-de-sol-guara/table/dqrdqmt',
    checkedAt: '2026-09-17',
  },
  'savassi-valparaiso': {
    url: 'https://savassicarnedesoletapae.saipos.com/savassi-carne-de-sol-etapa-e/table/dqrdnlm',
    checkedAt: '2026-09-17',
  },
};
