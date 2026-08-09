export type PlanCode = 'free' | 'pro' | 'premium' | 'enterprise';

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
    description: 'Perfil público básico, informações de contato e presença no guia.',
    features: ['Perfil público básico', 'Contato e informações', 'Página de planos'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceCents: 5990,
    billingInterval: 'monthly',
    description: 'Métricas básicas, edição de informações, agenda, eventos e promoções.',
    features: ['Métricas básicas', 'Editar informações', 'Agenda e eventos', 'Promoções', 'Fotos', 'Avaliações recebidas'],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceCents: 9990,
    billingInterval: 'monthly',
    description: 'Analytics detalhado, conversões, cardápio e relatórios avançados.',
    features: ['Tudo do Pro', 'Analytics detalhado', 'Conversões', 'Cardápio', 'Relatórios avançados', 'Maior destaque'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 15000,
    billingInterval: 'monthly',
    description: 'Visão consolidada, múltiplos estabelecimentos e atendimento prioritário.',
    features: ['Tudo do Premium', 'Múltiplos estabelecimentos', 'Usuários adicionais', 'Relatórios avançados', 'Atendimento prioritário'],
  },
};

export const PAID_PLANS: PlanCode[] = ['pro', 'premium', 'enterprise'];

export function getPlan(planId: string | undefined): PlanDefinition | undefined {
  return planId ? PLAN_CATALOG[planId as PlanCode] : undefined;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function isPaidPlan(planId: string | undefined): boolean {
  return planId !== undefined && planId !== 'free' && planId in PLAN_CATALOG;
}
