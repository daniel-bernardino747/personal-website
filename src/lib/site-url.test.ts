import { describe, expect, it } from 'vitest';

import { siteUrl } from './site-url';

describe('siteUrl', () => {
  it('uses the configured origin', () => {
    expect(siteUrl('https://preview.example.com').host).toBe('preview.example.com');
  });

  it('adds the scheme when it is missing', () => {
    expect(siteUrl('www.teamdbsolutions.com').toString()).toBe('https://www.teamdbsolutions.com/');
  });

  it('falls back to the default when empty or unparseable, instead of throwing', () => {
    expect(siteUrl('').host).toBe('www.teamdbsolutions.com');
    expect(siteUrl('   ').host).toBe('www.teamdbsolutions.com');
    expect(siteUrl(undefined).host).toBe('www.teamdbsolutions.com');
    expect(siteUrl('http://').host).toBe('www.teamdbsolutions.com');
  });
});
