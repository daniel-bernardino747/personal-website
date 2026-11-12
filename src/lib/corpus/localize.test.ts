import { describe, expect, it } from 'vitest';

import { localizeSiteJson } from './localize';
import type { SiteJson } from './schema';
import { parseStatement } from './statement';

const site: SiteJson = {
  version: 2,
  identity: {
    name: 'Ada Lovelace',
    initials: 'AL',
    role: ['Software Engineer', 'Mathematician'],
    location: 'London',
    headline: 'Building provable systems.',
    bookingUrl: 'https://cal.com/ada',
    social: { github: 'g', linkedin: 'l', email: 'e' },
    services: ['Custom software'],
    bio: 'I write programs.',
  },
  affiliations: [{ id: 'acme', organisation: 'Acme ("A Company")', role: 'Engineer', stack: [] }],
  accomplishments: [
    {
      id: 'app',
      affiliationId: 'acme',
      date: '2026-10-21',
      kind: 'project',
      title: 'Side Project',
      metric: '30 screens in 10 weeks',
      image: { src: '/projects/app.webp', alt: 'The app' },
      statement: 'Shipped a scheduling app. Built with React and Hono. Live: https://example.com',
      featured: true,
      isDraft: false,
    },
  ],
  translations: {
    pt: {
      texts: {
        'identity.role.0': 'Engenheira de Software',
        'identity.bio': 'Eu escrevo programas.',
        'identity.services.0': 'Software personalizado',
        'affiliation:acme.organisation': 'Acme',
        'accomplishment:app.prose': 'Lançou um app de agendamento.',
        'accomplishment:app.metric': '30 telas em 10 semanas',
      },
      missing: ['identity.role.1', 'identity.location'],
      stale: ['identity.headline'],
    },
  },
};

describe('localizeSiteJson', () => {
  const pt = localizeSiteJson(site, 'pt');

  it('uses the reviewed Portuguese where there is one', () => {
    expect(pt.identity?.bio).toBe('Eu escrevo programas.');
    expect(pt.identity?.services).toEqual(['Software personalizado']);
    expect(pt.affiliations[0].organisation).toBe('Acme');
    expect(pt.accomplishments[0].metric).toBe('30 telas em 10 semanas');
  });

  it('falls back to the English field by field, missing or stale alike', () => {
    expect(pt.identity?.role).toEqual(['Engenheira de Software', 'Mathematician']);
    expect(pt.identity?.location).toBe('London');
    expect(pt.identity?.headline).toBe('Building provable systems.');
    expect(pt.accomplishments[0].title).toBe('Side Project');
    expect(pt.affiliations[0].role).toBe('Engineer');
  });

  it('translates the prose and keeps the stack and links from the English', () => {
    const parsed = parseStatement(pt.accomplishments[0].statement);
    expect(parsed.prose).toBe('Lançou um app de agendamento.');
    expect(parsed.tech).toEqual(['React', 'Hono']);
    expect(parsed.liveUrl).toBe('https://example.com/');
  });

  it('leaves English untouched', () => {
    expect(localizeSiteJson(site, 'en')).toBe(site);
  });

  it('never changes names, ids, dates or links', () => {
    expect(pt.identity?.name).toBe('Ada Lovelace');
    expect(pt.accomplishments[0].id).toBe('app');
    expect(pt.accomplishments[0].date).toBe('2026-10-21');
    expect(pt.accomplishments[0].image?.src).toBe('/projects/app.webp');
  });
});
