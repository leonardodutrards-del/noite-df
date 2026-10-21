import { NextRequest, NextResponse } from 'next/server';
import { getEstablishmentRepository } from '@/infrastructure/repositories';
import { recommendEstablishments } from '@/lib/ai/concierge';

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
    const places = await getEstablishmentRepository().listPublished();
    const suggestions = recommendEstablishments(message, places);
    return NextResponse.json({
      mode: 'deterministic',
      message: suggestions.length ? 'Encontrei opções cadastradas relacionadas ao seu pedido.' : 'Não encontrei opções confirmadas para esse pedido. Tente informar um bairro ou estilo.',
      suggestions,
      disclaimer: 'Sugestões baseadas no cadastro publicado. Preços, horários e disponibilidade devem ser confirmados com o estabelecimento.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Não foi possível consultar os estabelecimentos.' }, { status: 503 });
  }
}
