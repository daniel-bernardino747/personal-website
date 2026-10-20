import Anthropic from '@anthropic-ai/sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { answerStream, REFUSAL } from './answer-stream';
import type { Classification } from './classification';

/**
 * The chat's response body, against the SDK's real `MessageStream` — only the
 * network underneath is fake. Issue 13: refused and cut-short exchanges used to
 * close the response twice and never reach the transcript, and every refusal left
 * an unhandled rejection behind.
 */
const encoder = new TextEncoder();

function sse(event: string, data: object): string {
  return `event: ${event}\ndata: ${JSON.stringify({ type: event, ...data })}\n\n`;
}

const MESSAGE = {
  id: 'msg_1',
  type: 'message',
  role: 'assistant',
  model: 'claude-sonnet-5',
  content: [],
  stop_reason: null,
  stop_sequence: null,
  usage: { input_tokens: 10, output_tokens: 0 },
};

/**
 * A model that says `chunks` one at a time. With `hang`, it stops after them and
 * never finishes — the shape of an answer still arriving when something gives up.
 */
function model(chunks: string[], { hang = false } = {}) {
  const fetch = async (_url: unknown, init?: RequestInit) => {
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        init?.signal?.addEventListener('abort', () => {
          try {
            controller.error(new DOMException('aborted', 'AbortError'));
          } catch {}
        });
        const send = (s: string) => controller.enqueue(encoder.encode(s));
        send(sse('message_start', { message: MESSAGE }));
        send(sse('content_block_start', { index: 0, content_block: { type: 'text', text: '' } }));
        for (const text of chunks) {
          send(sse('content_block_delta', { index: 0, delta: { type: 'text_delta', text } }));
          await new Promise((r) => setTimeout(r, 1));
        }
        if (hang) return;
        send(sse('content_block_stop', { index: 0 }));
        send(sse('message_delta', { delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 5 } }));
        send(sse('message_stop', {}));
        controller.close();
      },
    });
    return new Response(body, { headers: { 'content-type': 'text/event-stream' } });
  };

  return new Anthropic({ apiKey: 'test', fetch: fetch as typeof globalThis.fetch, maxRetries: 0 }).messages.stream({
    model: 'claude-sonnet-5',
    max_tokens: 64,
    messages: [{ role: 'user', content: 'q' }],
  });
}

const said = (verdict: Classification['verdict'], label: string): Promise<Classification> =>
  Promise.resolve({ verdict, label, costUSD: 0 });

async function readAll(body: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(body).text();
}

let unhandled: unknown[];
const onUnhandled = (reason: unknown) => unhandled.push(reason);

beforeEach(() => {
  unhandled = [];
  process.on('unhandledRejection', onUnhandled);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  process.off('unhandledRejection', onUnhandled);
  vi.restoreAllMocks();
});

/** Lets the SDK's abort and our `record` callback settle. */
const settle = () => new Promise((r) => setTimeout(r, 20));

describe('answerStream', () => {
  it('streams an allowed answer and records it once, with its label', async () => {
    const record = vi.fn();
    const text = await readAll(
      answerStream({ stream: model(['Daniel ', 'ships.']), classification: said('allow', 'about_owner'), record }),
    );
    await settle();

    expect(text).toBe('Daniel ships.');
    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith('Daniel ships.', 'about_owner');
  });

  it('records a refusal — the case that was always lost', async () => {
    const record = vi.fn();
    const text = await readAll(
      answerStream({ stream: model(['def f():'], { hang: true }), classification: said('refuse', 'task'), record }),
    );
    await settle();

    expect(text).toBe(REFUSAL);
    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(REFUSAL, 'task');
  });

  it('leaves no unhandled rejection behind when it aborts the model on a refusal', async () => {
    await readAll(
      answerStream({ stream: model(['x'], { hang: true }), classification: said('refuse', 'injection'), record: () => {} }),
    );
    await settle();

    expect(unhandled).toEqual([]);
  });

  it('records what was said when the visitor goes away mid-answer, and stops the model', async () => {
    const record = vi.fn();
    const stream = model(['Daniel ', 'works ', 'with'], { hang: true });
    const reader = answerStream({ stream, classification: said('allow', 'about_owner'), record }).getReader();

    let received = '';
    while (received.length < 'Daniel works with'.length) {
      const { value } = await reader.read();
      received += new TextDecoder().decode(value);
    }
    await reader.cancel();
    await settle();

    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith('Daniel works with', 'about_owner');
    expect(stream.aborted).toBe(true);
    expect(unhandled).toEqual([]);
  });

  it('says so, and records it, when the model fails before a word', async () => {
    const record = vi.fn();
    const failing = new Anthropic({
      apiKey: 'test',
      maxRetries: 0,
      fetch: (async () => new Response('{"type":"error","error":{"type":"overloaded_error","message":"busy"}}', { status: 529 })) as typeof globalThis.fetch,
    }).messages.stream({ model: 'claude-sonnet-5', max_tokens: 64, messages: [{ role: 'user', content: 'q' }] });

    const text = await readAll(answerStream({ stream: failing, classification: said('allow', 'small_talk'), record }));
    await settle();

    expect(text).toMatch(/went wrong reaching the model/);
    expect(record).toHaveBeenCalledTimes(1);
    expect(record.mock.calls[0][1]).toBe('small_talk');
    expect(unhandled).toEqual([]);
  });
});
