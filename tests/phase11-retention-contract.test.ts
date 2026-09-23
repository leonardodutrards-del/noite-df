import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Fase 11 - retenção', () => {
  it('tem favoritos, preferências e roteiros persistentes', () => {
    const migration = readFileSync(resolve(process.cwd(), 'database/migrations/008_growth_retention_trials.sql'), 'utf8');
    expect(migration).toContain('user_favorites');
    expect(migration).toContain('user_preferences');
    expect(migration).toContain('saved_lists');
    expect(migration).toContain('saved_list_items');
  });

  it('protege os recursos via API autenticada', () => {
    const favoriteRoute = readFileSync(resolve(process.cwd(), 'app/api/user/favorites/route.ts'), 'utf8');
    expect(favoriteRoute).toContain('requireAuth');
    expect(favoriteRoute).toContain('establishmentService.getById');
  });
});
