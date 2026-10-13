import campaign from '@/data/commercial-instagram-2026-10-13.json';

export function campaignContact(instagram?: string, establishmentId?: string) {
  const handle = (instagram || '').replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').split(/[/?]/)[0].toLowerCase();
  const record = campaign.find(r => r.handle === handle);
  if (!record) {
    if (establishmentId === 'contexto-bar' || establishmentId === 'oscarito-brasilia') return { channel: 'Instagram', status: 'acknowledged', checkedAt: '2026-10-13', label: 'Atendimento recebeu instruções; adesão pendente' };
    if (['infinu-comunidade-criativa', 'ivv-swinebar', 'meatz-burger-sudoeste', 'galpao-17', 'ticiana-werner-wine-bar', 'five-sport-bar'].includes(establishmentId || '')) return { channel: 'E-mail', status: 'sent', checkedAt: '2026-10-13', label: 'E-mail enviado; leitura não confirmada' };
    return undefined;
  }
  return { channel: 'Instagram', status: record.status, checkedAt: '2026-10-13', label: record.status === 'sent' ? 'Aviso enviado; leitura não confirmada' : record.status === 'delivery_blocked' ? 'Entrega bloqueada pelo destinatário' : 'Perfil precisa de confirmação' };
}
