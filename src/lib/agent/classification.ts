/**
 * What both scope classifiers return, and the rules they share. The reasoning
 * behind the filter, and the numbers, are in `classifier.ts`.
 */
export type Verdict = 'allow' | 'refuse' | 'unknown';

export interface Classification {
  verdict: Verdict;
  /**
   * What the classifier actually said, stored with the transcript: `allow` or
   * `refuse` from Haiku, a scope label from Jev, `unexpected` when it answered
   * outside its options, `timeout` or `error` when no answer came back.
   */
  label: string;
  /** What the call cost, in US$. Zero when it failed before any usage came back. */
  costUSD: number;
}

/**
 * The whole budget, retries included — both classifiers run with retries off.
 * The route waits for max(classify, first token of the answer), so a limit below
 * the answer's usual first token costs visitors nothing, and anything above it
 * delays every message.
 */
export const CLASSIFIER_TIMEOUT_MS = 2_500;

/** Every failure passes the message through. See `classifier.ts` on why. */
export function failOpen(signal: AbortSignal): Classification {
  return { verdict: 'unknown', label: signal.aborted ? 'timeout' : 'error', costUSD: 0 };
}
