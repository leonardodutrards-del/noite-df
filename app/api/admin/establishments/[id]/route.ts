import { NextRequest, NextResponse } from 'next/server';
import { requireMasterAdmin } from '@/modules/auth/session';
import { establishmentService } from '@/modules/establishments/service';
import { sanitizeTextInput } from '@/lib/security';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireMasterAdmin(request);

    const establishment = await establishmentService.getById(id, user);
    if (!establishment) {
      return NextResponse.json({ error: 'Estabelecimento não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ establishment });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao buscar estabelecimento.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores master.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await requireMasterAdmin(request);
    const body = await request.json().catch(() => ({}));

    const updates: Record<string, unknown> = {};

    if (body.name && typeof body.name === 'string') {
      updates.name = sanitizeTextInput(body.name);
    }
    if (body.publicationStatus) {
      updates.publicationStatus = body.publicationStatus;
    }
    if (typeof body.verified === 'boolean') {
      updates.verified = body.verified;
    }
    if (typeof body.ownerManaged === 'boolean') {
      updates.ownerManaged = body.ownerManaged;
    }
    if (body.crowdStatus) {
      updates.crowdStatus = body.crowdStatus;
    }
    if (body.description) {
      updates.description = sanitizeTextInput(body.description);
    }
    if (body.address) {
      updates.address = sanitizeTextInput(body.address);
    }
    if (body.whatsapp) {
      updates.whatsapp = sanitizeTextInput(body.whatsapp);
    }
    if (body.instagram) {
      updates.instagram = sanitizeTextInput(body.instagram);
    }
    if (Array.isArray(body.weeklySchedule)) {
      updates.weeklySchedule = body.weeklySchedule;
    }
    if (body.currentPromotion) {
      updates.currentPromotion = body.currentPromotion;
    }

    const updated = await establishmentService.update(id, updates, user);
    return NextResponse.json({ establishment: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro ao atualizar estabelecimento.';
    if (msg === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }
    if (msg.startsWith('FORBIDDEN')) {
      return NextResponse.json({ error: 'Acesso restrito a administradores master.' }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
