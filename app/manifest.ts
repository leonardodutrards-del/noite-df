import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Noite DF', short_name: 'Noite DF', description: 'Guia inteligente de experiências locais do Distrito Federal.',
    start_url: '/', display: 'standalone', background_color: '#0b0b12', theme_color: '#0b0b12', lang: 'pt-BR'
  };
}
