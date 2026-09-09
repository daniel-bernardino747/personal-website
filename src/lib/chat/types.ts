/**
 * The transport shape for the chat's suggested questions and their answers.
 *
 * It lives outside `src/lib/corpus/` on purpose. The Corpus loader is
 * `server-only` and cannot be pulled into a client bundle, but the chat's client
 * components need this type — so the type sits here, importable from either
 * side, while the code that fills it from the Corpus stays behind the boundary
 * in `answers.ts`.
 */
export interface ChatAnswer {
  /** Stable key, matching the quick-action chip that offers this question. */
  id: string;
  /** The question as the visitor sees it posed. UI copy, not Corpus prose. */
  phrase: string;
  /** The answer, derived from the Corpus. Never written by hand. */
  response: string;
}
