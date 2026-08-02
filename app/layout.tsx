import type { Metadata, Viewport } from 'next';
import './globals.css';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: 'Noite DF — Onde vale a pena ir hoje?', template: '%s | Noite DF' },
  description: 'Agenda, bares, restaurantes, eventos e experiências locais do Distrito Federal, com curadoria e informação atualizada.',
  applicationName: 'Noite DF',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'Noite DF',
    description: 'Descubra onde vale a pena ir hoje no Distrito Federal.',
    type: 'website',
    locale: 'pt_BR',
    url: appUrl,
    siteName: 'Noite DF'
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { themeColor: '#0b0b12', colorScheme: 'dark' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
