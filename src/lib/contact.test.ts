import { describe, expect, it } from 'vitest';

import { whatsappHref } from './contact';

describe('whatsappHref', () => {
  it('keeps only the digits of the number and encodes the message', () => {
    expect(whatsappHref('+55 48 99684-4907', 'Oi, Daniel!')).toBe('https://wa.me/5548996844907?text=Oi%2C%20Daniel!');
  });

  it('leaves the message out when there is none', () => {
    expect(whatsappHref('+55 48 99684-4907')).toBe('https://wa.me/5548996844907');
  });
});
