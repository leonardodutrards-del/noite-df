import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { sanitizeTextInput } from '@/lib/security';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getSessionUserFromRequest(request);

    const establishment = await establishmentService.getById(id, user ?? undefined);
    if (!establishment) {
      return NextResponse.json({ error: 'Estabelecimento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ establishment });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao buscar estabelecimento.';
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso negado ao estabelecimento.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await getSessionUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    // Strict authorization: partner can only modify their own establishment
    if (user.role === 'partner' && user.establishmentId !== id) {
      return NextResponse.json({ error: 'Acesso negado a outro estabelecimento.' }, { status: 403 });
    }

    if (user.role !== 'admin' && user.role !== 'partner') {
      return NextResponse.json({ error: 'Perfil sem autorização de edição.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
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

    // Only admin can change publicationStatus directly on this endpoint
    if (user.role === 'admin' && body.publicationStatus) {
      updates.publicationStatus = body.publicationStatus;
    }

    const updated = await establishmentService.update(id, updates, user);
    return NextResponse.json({ establishment: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar estabelecimento.';
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso negado ao estabelecimento.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
