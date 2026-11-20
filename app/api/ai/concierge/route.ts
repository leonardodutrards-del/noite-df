import { NextRequest, NextResponse } from 'next/server';
import { getEstablishmentRepository } from '@/infrastructure/repositories';
import { analyzeConciergeQuery, recommendEstablishments } from '@/lib/ai/concierge';
import { generateConciergeReply } from '@/lib/ai/generative';
import { checkAuthRateLimit, requestIp } from '@/lib/security-rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 4096) return NextResponse.json({ error: 'Pedido muito grande.' }, { status: 413 });
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || !('message' in body) || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'Informe uma mensagem.' }, { status: 400 });
  }
  const message = body.message.trim();
  if (message.length < 3 || message.length > 500) {
    return NextResponse.json({ error: 'A mensagem deve ter entre 3 e 500 caracteres.' }, { status: 400 });
  }
  try {
    const allowed = await checkAuthRateLimit({ ip: requestIp(request.headers), email: 'public-concierge', limit: 20, windowSeconds: 900 });
    if (!allowed) return NextResponse.json({ error: 'Limite de consultas atingido. Tente novamente em alguns minutos.' }, { status: 429 });
    const places = await getEstablishmentRepository().listPublished();
    const suggestions = recommendEstablishments(message, places);
    const analysis = analyzeConciergeQuery(message);
    const aiReply = await generateConciergeReply(message, suggestions);
    return NextResponse.json({
      mode: aiReply ? 'generative' : 'deterministic',
      aiReply,
      message: suggestions.length ? 'Encontrei opções cadastradas relacionadas ao seu pedido.' : 'Não encontrei opções confirmadas para esse pedido. Tente informar um bairro ou estilo.',
      suggestions,
      clarification: analysis.needsClarification,
      notices: [
        ...(analysis.budgetMentioned ? ['Não é possível confirmar um orçamento em reais apenas com a faixa de preço cadastrada.'] : []),
        ...(analysis.timeMentioned ? ['Funcionamento e disponibilidade na data solicitada não foram verificados em tempo real.'] : []),
      ],
      disclaimer: 'Sugestões baseadas no cadastro publicado. Preços, horários e disponibilidade devem ser confirmados com o estabelecimento.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível consultar os estabelecimentos.' }, { status: 503 });
  }
}
