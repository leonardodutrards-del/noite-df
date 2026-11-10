'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('Noite DF: falha ao registrar o modo offline.', error);
      });
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const iosHelpTimer = isIos ? window.setTimeout(() => setShowIosHelp(true), 0) : undefined;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      if (iosHelpTimer !== undefined) window.clearTimeout(iosHelpTimer);
    };
  }, []);

  async function installApp() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  if (!installEvent && !showIosHelp) return null;

  return (
    <aside className="pwa-install" aria-live="polite">
      <div>
        <strong>Leve o Noite DF com você</strong>
        <p>
          {installEvent
            ? 'Instale o aplicativo para abrir a agenda direto da tela inicial.'
            : 'No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.'}
        </p>
      </div>
      {installEvent ? (
        <button type="button" onClick={() => void installApp()}>
          Instalar
        </button>
      ) : null}
      <button
        className="pwa-install-close"
        type="button"
        aria-label="Fechar aviso de instalação"
        onClick={() => setShowIosHelp(false)}
      >
        ×
      </button>
    </aside>
  );
}
