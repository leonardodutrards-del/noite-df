import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const home = readFileSync(resolve(process.cwd(), 'app/page.tsx'), 'utf8');
const placePage = readFileSync(resolve(process.cwd(), 'app/lugar/[slug]/page.tsx'), 'utf8');
const sitemap = readFileSync(resolve(process.cwd(), 'app/sitemap.ts'), 'utf8');
const service = readFileSync(resolve(process.cwd(), 'modules/establishments/service.ts'), 'utf8');
const memoryRepo = readFileSync(
  resolve(process.cwd(), 'infrastructure/repositories/in-memory-establishment-repository.ts'),
  'utf8'
);

describe('Dados públicos ao vivo do Supabase', () => {
  it('carrega a home pelo establishmentService', () => {
    expect(home).toContain('await establishmentService.search({})');
    expect(home).toContain('initialPlaces={places}');
  });

  it('carrega perfis e sitemap pelo repository', () => {
    expect(placePage).toContain('await establishmentService.getById(slug)');
    expect(sitemap).toContain('await establishmentService.search({})');
  });

  it('expõe publicamente somente registros published', () => {
    expect(service).toContain("publicationStatus !== 'published'");
    expect(memoryRepo).toContain("publicationStatus === 'published'");
  });
});
