import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Fase 9 - growth e mensuração', () => {
  it('integra GA4 sem remover analytics próprio', () => {
    const layout = readFileSync(resolve(process.cwd(), 'app/layout.tsx'), 'utf8');
    const analytics = readFileSync(resolve(process.cwd(), 'lib/analytics.ts'), 'utf8');
    expect(layout).toContain('GoogleAnalytics');
    expect(layout).toContain('GOOGLE_SITE_VERIFICATION');
    expect(analytics).toContain("gtag?.('event'");
    expect(analytics).toContain("fetch('/api/analytics/track'");
  });
});
