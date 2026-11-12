import { describe, expect, it } from 'vitest';

import { localeHref, routePath, stripLocale } from './routing';

describe('routePath', () => {
  it('rewrites a root path to the Portuguese page', () => {
    expect(routePath('/')).toEqual({ kind: 'rewrite', pathname: '/pt' });
    expect(routePath('/chat')).toEqual({ kind: 'rewrite', pathname: '/pt/chat' });
  });

  it('lets English through untouched', () => {
    expect(routePath('/en')).toEqual({ kind: 'next' });
    expect(routePath('/en/achievements')).toEqual({ kind: 'next' });
  });

  it('redirects the internal Portuguese prefix to the public URL', () => {
    expect(routePath('/pt')).toEqual({ kind: 'redirect', pathname: '/' });
    expect(routePath('/pt/chat')).toEqual({ kind: 'redirect', pathname: '/chat' });
  });

  it('lets files through in both languages', () => {
    expect(routePath('/resume.pdf')).toEqual({ kind: 'next' });
    expect(routePath('/images/avatar.png')).toEqual({ kind: 'next' });
    expect(routePath('/robots.txt')).toEqual({ kind: 'next' });
  });

  it('does not mistake a path that only starts with the letters for a prefix', () => {
    expect(routePath('/entrar')).toEqual({ kind: 'rewrite', pathname: '/pt/entrar' });
    expect(routePath('/ptx')).toEqual({ kind: 'rewrite', pathname: '/pt/ptx' });
  });
});

describe('stripLocale', () => {
  it('removes either prefix and leaves a root path alone', () => {
    expect(stripLocale('/en/chat')).toBe('/chat');
    expect(stripLocale('/pt/chat')).toBe('/chat');
    expect(stripLocale('/en')).toBe('/');
    expect(stripLocale('/chat')).toBe('/chat');
  });
});

describe('localeHref', () => {
  it('keeps Portuguese links as written', () => {
    expect(localeHref('pt', '/#about')).toBe('/#about');
  });

  it('prefixes English links, anchors included', () => {
    expect(localeHref('en', '/')).toBe('/en');
    expect(localeHref('en', '/#about')).toBe('/en#about');
    expect(localeHref('en', '/chat')).toBe('/en/chat');
  });

  it('leaves external links alone', () => {
    expect(localeHref('en', 'https://cal.com/x')).toBe('https://cal.com/x');
  });
});
