import { describe, it, expect } from 'vitest';
import { renderEmail } from '../apps/mobile/lib/email-templates';

describe('email template', () => {
  it('injects link and subject', () => {
    const { subject, html, text } = renderEmail({ type:'quote', company:'Co', recipient:'Jane', link:'https://x' });
    expect(subject).toContain('quote');
    expect(html).toContain('https://x');
    expect(text).toContain('https://x');
  });
});
