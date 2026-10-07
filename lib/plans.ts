export type PlanCode = 'free' | 'pro' | 'premium' | 'enterprise';

export type PlanCapability =
  | 'view_dashboard'
  | 'edit_profile'
  | 'manage_agenda'
  | 'manage_promotions'
  | 'analytics_basic'
  | 'analytics_detailed'
  | 'manage_menu'
  | 'priority_support';

export interface PlanDefinition {
  id: PlanCode;
  name: string;
  priceCents: number;
  billingInterval: 'monthly';
  description: string;
  features: string[];
}

export const PLAN_CATALOG: Record<PlanCode, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Gratuito',
    priceCents: 0,
    billingInterval: 'monthly',
    description: 'Presença básica no guia enquanto o estabelecimento decide se quer operar o perfil.',
    features: ['Perfil público básico', 'Informações públicas de contato', 'Acesso ao painel em modo leitura'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 5990,
    billingInterval: 'monthly',
    description: 'Operação do perfil, agenda, promoções e métricas essenciais.',
    features: [
      'Editar nome, descrição, contato e endereço do perfil',
      'Publicar agenda e programação semanal',
      'Criar promoções e atualizar lotação em tempo real',
      'Ver visualizações, WhatsApp, rotas, Instagram e favoritos',
      'Ideal para operar o perfil e medir interesse básico',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceCents: 9990,
    billingInterval: 'monthly',
    description: 'Tudo do Pro com analytics detalhado, conversões e gestão de cardápio.',
    features: [
      'Tudo do Pro',
      'Analytics detalhado e taxa de conversão',
      'Comparação de desempenho em períodos maiores',
      'Leitura mais completa do comportamento dos visitantes',
      'Adicionar link oficial de cardápio ao perfil',
      'Ideal para otimizar divulgação e conversão',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 15000,
    billingInterval: 'monthly',
    description: 'Tudo do Premium com atendimento e configuração prioritários.',
    features: [
      'Tudo do Premium',
      'Atendimento prioritário',
      'Configuração assistida do perfil e recursos',
      'Acompanhamento mais próximo da operação',
      'Ideal para operações que querem suporte dedicado',
    ],
  },
};

export const PLAN_CAPABILITIES: Record<PlanCode, PlanCapability[]> = {
  free: ['view_dashboard'],
  pro: ['view_dashboard', 'edit_profile', 'manage_agenda', 'manage_promotions', 'analytics_basic'],
  premium: [
    'view_dashboard',
    'edit_profile',
    'manage_agenda',
    'manage_promotions',
    'analytics_basic',
    'analytics_detailed',
    'manage_menu',
  ],
  enterprise: [
    'view_dashboard',
    'edit_profile',
    'manage_agenda',
    'manage_promotions',
    'analytics_basic',
    'analytics_detailed',
    'manage_menu',
    'priority_support',
  ],
};

export const PLAN_RANK: Record<PlanCode, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  enterprise: 3,
};

export const PAID_PLANS: PlanCode[] = ['pro', 'premium', 'enterprise'];

export function getPlan(planId: string | undefined): PlanDefinition | undefined {
  return planId ? PLAN_CATALOG[planId as PlanCode] : undefined;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function isPaidPlan(planId: string | undefined): planId is Exclude<PlanCode, 'free'> {
  return Boolean(planId && planId !== 'free' && planId in PLAN_CATALOG);
}

export function planHasCapability(planCode: PlanCode, capability: PlanCapability): boolean {
  return PLAN_CAPABILITIES[planCode].includes(capability);
}
