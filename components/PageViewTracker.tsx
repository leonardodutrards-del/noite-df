'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

export function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (/^\/(admin|parceiro|login|visitante|pagamento|redefinir-senha|recuperar-senha)(\/|$)/.test(pathname)) return;
    const placeId = pathname.startsWith('/lugar/') ? decodeURIComponent(pathname.split('/')[2]) : undefined;
    track('page_view', placeId ? { establishmentId: placeId } : {});
  }, [pathname]);
  return null;
}
