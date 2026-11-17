import type { Offer } from ".";

/**
 * The offer to founders and small businesses abroad, shown on the English home
 * page (ADR-0019). The same way of working as the Portuguese offer, told to a
 * remote client: a call instead of a coffee, an international transfer instead
 * of Pix, and no clause names, because the contract templates in `contratos`
 * are Brazilian. Every promise below must be backed by the English contract
 * Daniel sends; when its terms change, update these lines.
 *
 * Draft, pending Daniel's approval.
 */
export const offer = {
  ids: {
    services: "services",
    process: "how-it-works",
    elo: "elo",
    guarantees: "guarantees",
    firstDelivery: "first-delivery",
    contact: "contact",
  },

  seo: {
    title: "Custom software for founders and small businesses",
    description:
      "Custom software, web and mobile apps, automations, AI agents and websites for founders and small businesses. Fixed-price contracts, a 90-day warranty and the project's progress in real time.",
  },

  hero: {
    greeting: "Hi, I’m",
    eyebrow: "Software developer in Brazil, working with clients anywhere",
    title: "Custom software for founders and small businesses.",
    lede: "Websites, systems, apps, automations and AI agents, built by one developer you talk to directly, with the project’s progress in real time.",
  },

  reach: {
    booking: { cta: "Book a call" },
    email: { cta: "Send an email", subject: "A project" },
  },

  services: {
    eyebrow: "Services",
    title: "What I build",
    notes: [
      "A system built around how your business works, not the other way around.",
      "Connect the tools you already use, get spreadsheets out of the way, fix the one bottleneck that slows you down.",
      "A mobile app, or one installed straight from the browser.",
      "Repetitive work running on its own: reminders, reports, invoices, messages.",
      "Support and back-office tasks with AI, where it actually helps.",
      "To present your business, bring in customers or sell online.",
    ],
  },

  process: {
    eyebrow: "How it works",
    title: "From the first call to delivery",
    steps: [
      { title: "A call", body: "We talk over video, and I understand the problem before we talk about technology." },
      { title: "Scope in writing", body: "You get what is in, what is out, what I need from you and the date of each milestone, in plain language." },
      { title: "Contract", body: "A fixed price, signed electronically. A deposit, then one payment per approved milestone, by international transfer and with an invoice." },
      { title: "Short milestones you test", body: "The project is split into parts you recognize and test on your phone, each with a date." },
      { title: "You approve", body: "At the end of each milestone you have 5 business days to point out anything that differs from what we agreed." },
      { title: "Delivery and warranty", body: "The code and instructions in your hands, and a 90-day warranty." },
    ],
  },

  speed: {
    title: "Why it is fast",
    points: [
      { title: "Milestones of days or weeks, not months", body: "You see and test what is ready at every milestone, instead of waiting for the end." },
      { title: "The time goes to what you asked for", body: "The parts every project repeats, such as sign-in, dashboards and payments, already exist and are reused, with a perpetual license for you." },
    ],
  },

  elo: {
    eyebrow: "Client portal",
    title: "You follow everything in Elo",
    lede: "Hired someone to build your software and the questions never stop? When will it be ready, what changed, what was agreed, how much is left to pay, whether anything is waiting on you. In Elo, the answer is one tap away.",
    points: [
      "The date of each milestone, and the reason whenever a deadline moves.",
      "What is ready, with a link to test it on your phone.",
      "What was agreed, in plain words, with the signed contract.",
      "Each payment, with its due date.",
      "What is waiting on you, with the date it was asked for.",
    ],
    closing: "No password and nothing to install: you open it from a private link.",
    screens: [],
  },

  guarantees: {
    eyebrow: "Guarantees",
    title: "What the contract promises",
    items: [
      { title: "A 90-day warranty", body: "After the last milestone, if anything works differently from what we agreed, I fix it at no cost." },
      { title: "The code is yours", body: "Once the project is paid, the code written for you is yours, with instructions to deploy it wherever you like." },
      { title: "Accounts in your name", body: "The domain, the app stores and every account that receives money stay in your name. Nothing that identifies your business is locked with me." },
      { title: "Your customers’ data", body: "I build and test with fictional data, and if a security incident happens you hear about it within 48 hours." },
      { title: "Confidentiality", body: "What I learn about your business stays between us." },
      { title: "Leave without a penalty", body: "You can end the contract with 15 days’ notice, pay for the work done and keep the code you paid for." },
      { title: "Changes only with your yes", body: "A change of scope comes in writing, with its impact on price and timeline, before anything else." },
    ],
  },

  firstDelivery: {
    eyebrow: "First delivery",
    accomplishmentId: "encaixai",
    speedNote: "From the spec to an app in production in two weeks, and Jadson uses it every day.",
  },

  contact: {
    eyebrow: "Contact",
    title: "Let’s talk about your project",
    lede: "Book a call at a time that suits you, or send me an email.",
    hours: (hours: string) => `Working hours: ${hours}.`,
    company: (name: string, legalName: string) => `${name} · ${legalName} · Brazil`,
  },
} as const satisfies Offer;
