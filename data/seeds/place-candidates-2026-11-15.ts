import type { Establishment } from '@/modules/establishments/types';
import type { DataSource } from '@/modules/shared/types';

export type EstablishmentCandidate = {
  status: 'confirmed_candidate' | 'pending_review';
  place: Establishment;
  sources: DataSource[];
  duplicateCheck: string[];
  reviewNote: string;
};

const source = (kind: DataSource['kind'], label: string, url: string): DataSource => ({
  kind,
  label,
  url,
  verifiedAt: '2026-11-15',
});

// Candidate records only: intentionally not imported by the public places seed.
export const candidatePlacesNovember15: EstablishmentCandidate[] = [
  {
    status: 'confirmed_candidate',
    place: {
      id: 'texxas-bar',
      name: 'Texxas Bar',
      region: 'Núcleo Bandeirante',
      type: 'Bar',
      description: 'Bar com programação de música ao vivo e festas de sertanejo e piseiro, conforme páginas oficiais de eventos de novembro de 2026.',
      address: 'SIBS Q 1, Conjunto D — Núcleo Bandeirante, Brasília, DF',
      vibe: ['música ao vivo', 'dança', 'eventos'],
      music: ['sertanejo', 'piseiro', 'forró'],
      audience: ['maiores de 18 anos'],
      instagram: 'https://www.instagram.com/texxasbarbsb/',
      whatsapp: '+55 61 99450-8262',
      businessContact: {
        phone: '+55 61 99450-8262',
        whatsapp: '+55 61 99450-8262',
        sourceUrl: 'https://www.sympla.com.br/evento/texxas-bar-sexta-biu-do-piseiro-chama-na-bota-papai-gala-do-piseiro-dj-eddy-viana/3636959',
        checkedAt: '2026-11-15',
      },
      mapsQuery: 'Texxas Bar SIBS Q 1 Conjunto D Núcleo Bandeirante Brasília DF',
      verified: false,
      ownerManaged: false,
      crowdStatus: 'a confirmar',
      weeklySchedule: [],
      lastUpdated: '2026-11-15',
      publicationStatus: 'draft',
      source: source('official', 'Sympla — TEXXAS BAR, evento oficial', 'https://www.sympla.com.br/evento/texxas-bar-sexta-biu-do-piseiro-chama-na-bota-papai-gala-do-piseiro-dj-eddy-viana/3636959'),
    },
    sources: [
      source('official', 'Sympla — TEXXAS BAR, 19/11', 'https://www.sympla.com.br/evento/texxas-bar-quinta-vespera-de-feriado-as-sertanejas-nego-rainner-dj-eddy-viana/3653610'),
      source('official', 'Sympla — TEXXAS BAR, 21/11', 'https://www.sympla.com.br/evento/texxas-bar-moleca-100-vergonha-sabado-so-pra-xamegar-spx-dj-hercules/3637061'),
      source('official', 'Sympla — TEXXAS BAR, 27/11', 'https://www.sympla.com.br/evento/texxas-bar-sexta-biu-do-piseiro-chama-na-bota-papai-gala-do-piseiro-dj-eddy-viana/3636959'),
      source('official', 'Sympla — TEXXAS BAR, 28/11', 'https://www.sympla.com.br/evento/lgc/3642481'),
    ],
    duplicateCheck: [
      'Supabase consultado por nome normalizado, variações, slug texxas-bar, Instagram @texxasbarbsb, endereço SIBS Q 1 Conjunto D e telefone 61 99450-8262: nenhum registro correspondente encontrado.',
    ],
    reviewNote: 'Candidato confirmado por páginas oficiais de eventos e produtor TEXXAS BAR. O rótulo de região Núcleo Bandeirante ainda não existe entre as 22 regiões atuais; revisar inclusão no filtro antes de publicar.',
  },
  {
    status: 'confirmed_candidate',
    place: {
      id: 'estacao-beira-lago',
      name: 'Estação Beira Lago',
      region: 'Setor de Clubes Sul',
      type: 'Bar',
      description: 'Bar e espaço de eventos no Setor de Clubes Sul, com programação anunciada de samba, pagode e eventos gastronômicos.',
      address: 'SCES Trecho 1, Conjunto 03, pavimento térreo — Setor de Clubes Sul, Brasília, DF, 70200-001',
      vibe: ['música ao vivo', 'eventos', 'gastronomia'],
      music: ['samba', 'pagode', 'sertanejo'],
      audience: [],
      businessContact: {
        phone: '+55 61 99558-1303',
        whatsapp: '+55 61 99558-1303',
        sourceUrl: 'https://casadosdados.com.br/solucao/cnpj/estacao-beira-lago-ltda-62006612000149',
        checkedAt: '2026-11-15',
      },
      mapsQuery: 'Estação Beira Lago SCES Trecho 1 Conjunto 03 Brasília DF',
      verified: false,
      ownerManaged: false,
      crowdStatus: 'a confirmar',
      weeklySchedule: [],
      lastUpdated: '2026-11-15',
      publicationStatus: 'draft',
      source: source('official', 'Sympla — Estação Beira Lago, evento oficial', 'https://www.sympla.com.br/evento/bola-samba-e-feijao/3653111'),
    },
    sources: [
      source('official', 'Sympla — Estação Beira Lago, 15/11', 'https://www.sympla.com.br/evento/lgc/3631552'),
      source('official', 'Sympla — Estação Beira Lago, 21/11', 'https://www.sympla.com.br/evento/bola-samba-e-feijao/3653111'),
      source('external', 'Consulta pública CNPJ — situação ativa e CNAEs de bar/restaurante/eventos', 'https://casadosdados.com.br/solucao/cnpj/estacao-beira-lago-ltda-62006612000149'),
    ],
    duplicateCheck: [
      'Supabase consultado por nome normalizado, variações, slug estacao-beira-lago, endereço SCES Trecho 1 Conjunto 03 e telefones 61 99558-1303 / 61 99958-1311: nenhum registro correspondente encontrado.',
    ],
    reviewNote: 'Nome fantasia e situação cadastral ativa constam na consulta pública do CNPJ; páginas oficiais Sympla do próprio produtor confirmam o local e dois eventos atuais. A base CNPJ classifica o bairro como Asa Sul, enquanto os eventos indicam Setor de Clubes Sul; manter o endereço completo e revisar a etiqueta regional.',
  },
  {
    status: 'confirmed_candidate',
    place: {
      id: 'arena-dose-dupla',
      name: 'Arena Dose Dupla',
      region: 'Ceilândia',
      type: 'Bar',
      description: 'Bar e espaço de música ao vivo conhecido por programação de forró e piseiro; evento oficial de 15/11/2026 confirma atividade recente.',
      address: 'QNM 09, Conjunto A, Lotes 02 e 04 — Ceilândia Sul, Brasília, DF, 72215-091',
      vibe: ['música ao vivo', 'dança', 'eventos'],
      music: ['forró', 'piseiro'],
      audience: ['maiores de 18 anos'],
      businessContact: {
        phone: '+55 61 99943-9720',
        sourceUrl: 'https://www.sympla.com.br/evento/10-horas-de-forro/3614097',
        checkedAt: '2026-11-15',
      },
      mapsQuery: 'Arena Dose Dupla QNM 09 Conjunto A Lotes 02 e 04 Ceilândia Sul Brasília DF',
      verified: false,
      ownerManaged: false,
      crowdStatus: 'a confirmar',
      weeklySchedule: [],
      lastUpdated: '2026-11-15',
      publicationStatus: 'draft',
      source: source('official', 'Sympla — 10 Horas de Forró, Arena Dose Dupla', 'https://www.sympla.com.br/evento/10-horas-de-forro/3614097'),
    },
    sources: [
      source('official', 'Sympla — 10 Horas de Forró, 15/11', 'https://www.sympla.com.br/evento/10-horas-de-forro/3614097'),
      source('external', 'Consulta pública CNPJ — Esquina Choperia LTDA / Arena Dose Dupla', 'https://cnpj.biz/30103636000120'),
      source('external', 'TocaOnde — programação recente descoberta em publicação do Instagram', 'https://tocaonde.com.br/events/206965-kuque-do-piseiro-arena-dose-dupla-brasilia'),
    ],
    duplicateCheck: [
      'Supabase consultado por nome normalizado, variações, slug arena-dose-dupla, endereço QNM 09 Conjunto A Lotes 02 e 04 e telefone 61 99943-9720: nenhum registro correspondente encontrado.',
    ],
    reviewNote: 'CNPJ público indica Esquina Choperia LTDA / nome fantasia Arena Dose Dupla em situação ativa; Sympla confirma evento em 15/11 e endereço em Ceilândia. O telefone veio da página do evento, não foi confirmado como WhatsApp.',
  },
];
