import { describe, expect, it } from 'vitest';

import type { Identity } from './corpus/schema';
import { localBusinessJsonLd, localeAlternates, shareImage } from './seo';

describe('localeAlternates', () => {
  it('gives each language its own canonical and points at the other', () => {
    expect(localeAlternates('/chat', 'en')).toEqual({
      canonical: '/en/chat',
      languages: { 'pt-BR': '/chat', en: '/en/chat', 'x-default': '/chat' },
    });
    expect(localeAlternates('/', 'pt').canonical).toBe('/');
    expect(localeAlternates('/', 'en').languages.en).toBe('/en');
  });

  it('draws a share image per language', () => {
    expect(shareImage('pt', 'x').url).toBe('/og/pt.png');
  });
});

describe('localBusinessJsonLd', () => {
  const identity: Identity = {
    name: 'Daniel Bernardino de Souza',
    initials: 'DB',
    role: ['Desenvolvedor Fullstack'],
    location: 'Criciúma, Santa Catarina, Brasil',
    bookingUrl: 'https://cal.com/x',
    social: { github: 'https://github.com/x', linkedin: 'https://linkedin.com/in/x', email: 'hello@x.com', whatsapp: '+55 48 99684-4907' },
    services: ['Software personalizado', 'Sites'],
    serviceArea: 'Criciúma e região',
    inPerson: true,
    business: { name: 'Team DB Solutions', legalName: 'DB SOFTWARE SOLUTIONS LTDA', cnpj: '63.169.584/0001-43' },
    bio: 'bio',
  };
  const ld = localBusinessJsonLd(identity, 'Software sob medida em Criciúma.');

  it('is a service-area business with no street address', () => {
    expect(ld['@type']).toBe('ProfessionalService');
    expect(ld).not.toHaveProperty('address');
    expect(ld.areaServed).toContainEqual({ '@type': 'City', name: 'Criciúma' });
  });

  it('carries the company, the WhatsApp and the services from the Identity', () => {
    expect(ld).toMatchObject({ name: 'Team DB Solutions', taxID: '63.169.584/0001-43', telephone: '+55 48 99684-4907' });
    expect(ld.hasOfferCatalog?.itemListElement).toHaveLength(2);
    expect(ld.founder.name).toBe('Daniel Bernardino de Souza');
  });
});
