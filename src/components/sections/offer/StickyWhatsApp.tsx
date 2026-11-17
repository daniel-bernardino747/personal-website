"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { whatsappHref } from "@/lib/contact";

/**
 * On a phone, once the hero (and its buttons) scrolls away, the WhatsApp button
 * stays at the bottom of the screen. Hidden again over the contact section,
 * which has its own.
 */
export function StickyWhatsApp({
  whatsapp,
  cta,
  message,
  contactId,
}: {
  whatsapp: string;
  cta: string;
  message: string;
  /** The contact section, over which the button hides. */
  contactId: string;
}) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const contact = document.getElementById(contactId);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting);
        if (entry.target === contact) setContactVisible(entry.isIntersecting);
      }
    });
    if (hero) observer.observe(hero);
    if (contact) observer.observe(contact);
    return () => observer.disconnect();
  }, [contactId]);

  const shown = !heroVisible && !contactVisible;

  return (
    <a
      href={whatsappHref(whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
      className={`fixed inset-x-4 bottom-4 z-40 flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white shadow-2xl shadow-accent/30 transition-all duration-300 md:hidden ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <MessageCircle size={18} aria-hidden="true" />
      {cta}
    </a>
  );
}
