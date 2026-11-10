'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'noite-df:pwa-install-dismissed-at';
const DISMISS_FOR_DAYS = 30;

function wasRecentlyDismissed() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY));
    return Number.isFinite(dismissedAt) && dismissedAt > 0 &&
      Date.now() - dismissedAt < DISMISS_FOR_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Installation remains available when browser storage is disabled.
  }
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installError, setInstallError] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
        console.error('Noite DF: falha ao registrar o modo offline.', error);
      });
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || wasRecentlyDismissed()) return;

    const isIos =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    const iosHelpTimer = isIos ? window.setTimeout(() => setShowIosHelp(true), 1200) : undefined;

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallError(false);
      setInstallEvent(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallEvent(null);
      setShowIosHelp(false);
      rememberDismissal();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      if (iosHelpTimer !== undefined) window.clearTimeout(iosHelpTimer);
    };
  }, []);

  async function installApp() {
    if (!installEvent) return;
    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === 'dismissed') rememberDismissal();
      setInstallEvent(null);
    } catch {
      setInstallError(true);
    }
  }

  function dismissPrompt() {
    rememberDismissal();
    setInstallEvent(null);
    setShowIosHelp(false);
  }

  if (!installEvent && !showIosHelp) return null;

  return (
    <aside className="pwa-install" aria-live="polite">
      <div>
        <strong>Leve o Noite DF com você</strong>
        <p>
          {installError
            ? 'Não foi possível iniciar a instalação agora. Você pode tentar novamente pelo menu do navegador.'
            : installEvent
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
        onClick={dismissPrompt}
      >
        ×
      </button>
    </aside>
  );
}
