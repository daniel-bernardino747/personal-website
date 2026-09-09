'use client';

import { useChatAnswers } from '@/components/ChatAnswersProvider';
import { useChatMutation } from '@/hooks/useChatMutation';
import { useChatStore } from '@/store/useChatStore';
import { ArrowRight, Bot, Briefcase, Layers, Search, Smile, Trash2, UserSearch } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MarkdownMessage } from './MarkdownMessage';

/**
 * The chips that offer the suggested questions. `id` keys into the
 * Corpus-derived answers from `ChatAnswersProvider` — the labels and icons are
 * UI copy, the answers behind them are not.
 *
 * There used to be a "Fun" chip here. It was dropped rather than re-pointed:
 * the Corpus has no Accomplishment about what Daniel does for fun, and it should
 * not — an Accomplishment needs a Metric. Its slot went to the one question this
 * Corpus answers better than any other.
 */
const quickActions = [
  { icon: <Smile size={14} />, id: 'me', label: 'Me', color: 'emerald' },
  { icon: <Briefcase size={14} />, id: 'projects', label: 'Projects', color: 'green' },
  { icon: <Layers size={14} />, id: 'skills', label: 'Skills', color: 'violet' },
  { icon: <Bot size={14} />, id: 'site', label: 'This site', color: 'pink' },
  { icon: <UserSearch size={14} />, id: 'contact', label: 'Contact', color: 'amber' },
];

const chipColorMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  green: { bg: 'bg-green-400/10', text: 'text-green-400' },
  violet: { bg: 'bg-violet-400/10', text: 'text-violet-400' },
  pink: { bg: 'bg-pink-400/10', text: 'text-pink-400' },
  amber: { bg: 'bg-amber-400/10', text: 'text-amber-400' },
};

export function ChatContainer() {
  const answers = useChatAnswers();
  const { messages, addMessage, clearHistory } = useChatStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const autoScrollRef = useRef(true);

  const mutation = useChatMutation();

  // The typewriter used to drive this through `onUpdate`. Tokens now arrive from
  // the stream instead, so the scroll follows the message text itself — the last
  // message grows character by character and this fires on each growth.
  const lastMessageText = messages[messages.length - 1]?.text ?? '';
  useEffect(() => {
    scrollToBottom('auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageText, messages.length]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isScrollingUp = scrollTop < lastScrollTopRef.current;
    lastScrollTopRef.current = scrollTop;

    // Use a larger threshold (100px) and handle sub-pixel values
    const isAtBottom = scrollHeight - Math.ceil(scrollTop) - clientHeight <= 100;

    if (isScrollingUp && !isAtBottom) {
      autoScrollRef.current = false;
    } else if (isAtBottom) {
      autoScrollRef.current = true;
    }
  };

  /**
   * Scrolls the message list, and only the message list.
   *
   * This used `messagesEndRef.current.scrollIntoView()`, which scrolls *every*
   * scrollable ancestor — including the document. On a short viewport the page
   * itself has scroll, so each arriving chunk dragged the whole page up and the
   * header out of view. It looked like a production-only bug because a tall
   * window has no document scroll to drag.
   *
   * Setting `scrollTop` on the container cannot touch anything outside it.
   */
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (!autoScrollRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || mutation.isPending) return;
    
    setInputValue('');
    autoScrollRef.current = true;
    addMessage({ role: 'user', text: text });
    mutation.mutate(text);
  };

  const handleQuickAction = (id: string) => {
    if (mutation.isPending) return;

    const answer = answers.find(entry => entry.id === id);
    const phrase = answer ? answer.phrase : id;

    autoScrollRef.current = true;
    addMessage({ role: 'user', text: phrase });
    mutation.mutate(phrase);
  };

  return (
    <>
      {/* Message List */}
      {/*
        `min-h-0` is load-bearing. A flex item defaults to `min-height: auto`,
        which refuses to shrink below its content — so `flex-1 overflow-y-auto`
        alone never scrolls: the list grows, the page grows past the viewport,
        and the document scrolls instead of the list. With the parent at
        `h-screen` and this at `min-h-0`, the scroll lives where it belongs.
      */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto py-6 relative"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <button
          onClick={() => {
            if (confirm('Clear chat history?')) clearHistory();
          }}
          className="fixed top-24 right-6 z-20 p-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer shadow-lg backdrop-blur-md"
          title="Clear History (Debug)"
        >
          <Trash2 size={20} />
        </button>

        <div className="max-w-2xl mx-auto px-4 flex flex-col gap-4">
          {messages.length === 0 && !mutation.isPending && (
            <div className="text-center text-muted-foreground text-sm py-12">
              Ask me anything using the buttons below or type a message.
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                  // The agent's Markdown carries its own paragraphs and lists;
                  // `whitespace-pre-wrap` on top of that would double every gap.
                  // A visitor's message is literal text and still needs it.
                  msg.role === 'user' ? 'whitespace-pre-wrap ' : ''
                }${
                  msg.role === 'ai'
                    ? 'bg-surface border border-border rounded-2xl rounded-tl-sm text-foreground'
                    : 'bg-accent/10 border border-accent/20 rounded-2xl rounded-tr-sm text-foreground'
                }`}
              >
                {msg.role === 'ai' ? <MarkdownMessage text={msg.text} /> : msg.text}
                {msg.role === 'ai' && msg.text === '' && (
                  <span className="inline-block w-1 h-3.5 bg-accent/50 align-middle animate-pulse" />
                )}
              </div>
            </div>
          ))}

          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="inline-block w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur-md py-4">
        <div className="max-w-2xl mx-auto px-4 flex flex-col gap-3">
          {/* Quick Actions Chips */}
          <div className="flex flex-wrap gap-2 mb-1">
            {quickActions.map((action, index) => {
              const colors = chipColorMap[action.color];
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={mutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 ${colors.bg} ${colors.text} text-[11px] font-medium hover:bg-white/10 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-accent/50 to-violet-500/50 blur rounded-full opacity-25 group-focus-within:opacity-50 transition duration-300" />
            <div className="relative flex items-center bg-background/80 border border-border rounded-full px-5 py-3 backdrop-blur-xl focus-within:border-accent/50 transition-all">
              <Search size={18} className="text-accent/70 mr-3 shrink-0" />
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={mutation.isPending}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground text-sm selection:bg-accent/30 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={mutation.isPending}
                className="ml-3 p-2 rounded-full bg-accent text-white hover:bg-accent/80 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-accent/20 cursor-pointer shrink-0 disabled:opacity-50 disabled:scale-100"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
