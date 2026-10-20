import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./classifier-haiku', () => ({
  classifyWithHaiku: vi.fn(async () => ({ verdict: 'allow', label: 'allow', costUSD: 0 })),
}));
vi.mock('./classifier-jev', () => ({
  classifyWithJev: vi.fn(async () => ({ verdict: 'allow', label: 'about_owner', costUSD: 0 })),
}));

import { classifyWithHaiku } from './classifier-haiku';
import { classifyWithJev } from './classifier-jev';

/** `SCOPE_CLASSIFIER` picks the classifier; Haiku stays the default. */
const saved = { selector: process.env.SCOPE_CLASSIFIER, key: process.env.TYPESAFE_API_KEY };

async function freshClassifier() {
  vi.resetModules();
  return (await import('./classifier')).classifyQuestion;
}

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  for (const [name, value] of [
    ['SCOPE_CLASSIFIER', saved.selector],
    ['TYPESAFE_API_KEY', saved.key],
  ] as const) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
  vi.restoreAllMocks();
});

describe('classifyQuestion', () => {
  it('uses Haiku when nothing is set', async () => {
    delete process.env.SCOPE_CLASSIFIER;
    const classify = await freshClassifier();
    expect(await classify('hi')).toMatchObject({ label: 'allow' });
    expect(classifyWithHaiku).toHaveBeenCalledWith('hi');
    expect(classifyWithJev).not.toHaveBeenCalled();
  });

  it('uses Jev when asked', async () => {
    process.env.SCOPE_CLASSIFIER = 'jev';
    process.env.TYPESAFE_API_KEY = 'test';
    const classify = await freshClassifier();
    expect(await classify('hi')).toMatchObject({ label: 'about_owner' });
    expect(classifyWithJev).toHaveBeenCalledWith('hi');
    expect(classifyWithHaiku).not.toHaveBeenCalled();
  });

  it('treats a misspelt selector as unset', async () => {
    process.env.SCOPE_CLASSIFIER = 'jevv';
    const classify = await freshClassifier();
    await classify('hi');
    expect(classifyWithHaiku).toHaveBeenCalled();
  });

  it('says once, in the logs, that Jev was chosen without a key', async () => {
    process.env.SCOPE_CLASSIFIER = 'jev';
    delete process.env.TYPESAFE_API_KEY;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const classify = await freshClassifier();

    await classify('one');
    await classify('two');

    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0][0])).toContain('TYPESAFE_API_KEY');
    // Still Jev, failing open — not quietly Haiku under another name.
    expect(classifyWithJev).toHaveBeenCalledTimes(2);
  });
});
