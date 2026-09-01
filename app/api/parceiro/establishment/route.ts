import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { sanitizeTextInput } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    let establishmentId = user.establishmentId;
    if (user.role === 'admin') {
      const queryId = request.nextUrl.searchParams.get('id');
      if (queryId) establishmentId = queryId;
    }

    if (!establishmentId) {
      return NextResponse.json({ establishment: null });
    }

    const establishment = await establishmentService.getById(establishmentId, user);
    return NextResponse.json({ establishment });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao carregar estabelecimento.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso negado ao estabelecimento.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json().catch(() => ({}));

    let targetEstablishmentId = user.establishmentId;

    // If partner tries to explicitly update a different establishment
    if (user.role === 'partner') {
      if (body.establishmentId && body.establishmentId !== user.establishmentId) {
        return NextResponse.json({ error: 'Acesso negado a outro estabelecimento.' }, { status: 403 });
      }
      if (!targetEstablishmentId) {
        return NextResponse.json({ error: 'Nenhum estabelecimento associado a esta conta.' }, { status: 400 });
      }
    } else if (user.role === 'admin') {
      targetEstablishmentId = body.establishmentId || request.nextUrl.searchParams.get('id') || user.establishmentId;
      if (!targetEstablishmentId) {
        return NextResponse.json({ error: 'ID do estabelecimento é obrigatório para admin.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Perfil sem permissão de edição.' }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};

    if (body.crowdStatus && ['tranquilo', 'movimentado', 'lotado', 'a confirmar'].includes(body.crowdStatus)) {
      updates.crowdStatus = body.crowdStatus;
    }
    if (Array.isArray(body.weeklySchedule)) {
      updates.weeklySchedule = body.weeklySchedule;
    }
    if (body.currentPromotion && typeof body.currentPromotion === 'object') {
      updates.currentPromotion = {
        title: sanitizeTextInput(body.currentPromotion.title || ''),
        validUntil: sanitizeTextInput(body.currentPromotion.validUntil || ''),
        description: sanitizeTextInput(body.currentPromotion.description || ''),
      };
    }
    if (typeof body.description === 'string') {
      updates.description = sanitizeTextInput(body.description);
    }
    if (typeof body.whatsapp === 'string') {
      updates.whatsapp = sanitizeTextInput(body.whatsapp);
    }
    if (typeof body.instagram === 'string') {
      updates.instagram = sanitizeTextInput(body.instagram);
    }
    if (typeof body.address === 'string') {
      updates.address = sanitizeTextInput(body.address);
    }
    if (Array.isArray(body.vibe)) {
      updates.vibe = body.vibe.map((v: string) => sanitizeTextInput(String(v)));
    }
    if (Array.isArray(body.music)) {
      updates.music = body.music.map((m: string) => sanitizeTextInput(String(m)));
    }

    const updated = await establishmentService.update(targetEstablishmentId, updates, user);
    return NextResponse.json({ establishment: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar estabelecimento.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
