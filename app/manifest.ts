import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Noite DF — Agenda e experiências',
    short_name: 'Noite DF',
    description: 'Descubra bares, eventos, música ao vivo e experiências no Distrito Federal e Entorno.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b0b12',
    theme_color: '#0b0b12',
    lang: 'pt-BR',
    categories: ['entertainment', 'lifestyle', 'travel'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
    ]
  };
}
