"use client";

import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useDictionary } from "@/components/DictionaryProvider";
import { useLocaleHref } from "@/i18n/client";

type FormState = "idle" | "sending" | "done" | "error";

export default function GuestbookPage() {
  const localeHref = useLocaleHref();
  const { guestbook: t } = useDictionary();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) throw new Error("Request failed");
      setStatus("done");
      setName("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <Link
        href={localeHref("/")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        {t.back}
      </Link>

      <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
      <p className="text-muted-foreground text-lg mb-12">
        {t.lede}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium mb-2"
          >
            {t.name}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={status === "sending"}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
            autoComplete="name"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-2"
          >
            {t.message}
          </label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={status === "sending"}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={status === "sending" || !name.trim() || !message.trim()}
          className="flex items-center gap-2"
        >
          <Send size={16} strokeWidth={2} aria-hidden="true" />
          {status === "sending" ? t.sending : t.submit}
        </Button>

        {status === "done" && (
          <p role="status" className="text-sm text-green-600 font-medium">
            {t.done}
          </p>
        )}
        {status === "error" && (
          <p role="alert" className="text-sm text-red-600 font-medium">
            {t.error}
          </p>
        )}
      </form>
    </div>
  );
}
