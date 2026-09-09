---
name: recon
description: >-
  Investigate a target company from public sources, find the pain it has not
  advertised, and produce a dossier plus a direct approach to the person who can
  decide. Use when Daniel names a company he wants to work with or sell to, asks
  who to contact there, wants a cold email or DM to a founder/CEO/CTO, wants to
  know a company's real stack or hiring process, or says a job posting is thin
  and he wants to go around it. Writes to `generated/recon/` — every finding
  verified in-session, never inferred and never invented.
---

# Recon

Turn a company name into two things: a **dossier** of what is verifiably true
about them right now, and an **approach** that leads with a problem of theirs
you already solved. The premise is that a job posting is a company's *self-report*
of what it needs, and a self-report is the weakest available evidence. What is
actually broken, actually stale, actually unstaffed — that is the real brief, and
it is almost always visible from outside.

The output is not a summary of a company. It is an argument for a conversation,
built out of things they did not tell you.

Read `CONTEXT.md` for the Corpus vocabulary (Accomplishment, Affiliation, Metric,
Featured, draft) — the approach is only as strong as the evidence you can pull
from `content/`, and this skill never writes career claims, it only selects them.

## The one rule that overrides everything

**Never assert a finding you did not verify in this session.** This is
[ADR-0003](../../../docs/adr/0003-no-fabrication-with-source-traceability.md)
pointed outward: the same prohibition that keeps invented metrics out of a
résumé keeps invented facts out of an approach. The stakes are higher here,
because a wrong claim is not merely unsupported — it is sent to a stranger who
can check it in ten seconds.

Concretely:

- **Aggregators are leads, not sources.** RocketReach, Econodata, ZoomInfo,
  Apollo, and CNPJ-scraper sites are where you learn what to *check*. A contact,
  an email pattern, or a headcount from one of them is **INFERIDO** until it is
  confirmed against the company's own surface — their HTML, their DNS, their
  GitHub, their ATS.
- **Label every finding CONFIRMADO or INFERIDO** in the dossier, and never
  promote one to the other silently. An inferred email pattern is a useful thing
  to hand Daniel; a pattern presented as fact is how he burns a first contact.
- **Never put an INFERIDO finding in the approach itself.** The dossier may carry
  informed guesses. The email may not. Anything Daniel sends must be something he
  could defend if the recipient replied "where did you get that?"
- If a claim is time-sensitive (a broken page, an open role, an unlinked file),
  it does not go out without a **re-verification step** — see *Findings expire*.

When unsure whether something was observed or assumed, treat it as assumed.

## Homonyms will wreck you — anchor identity first

Before any other scan, pin the target to an identifier that cannot be shared by a
namesake, and re-check that anchor every time a new surface is found. In Brazil
the **CNPJ** is the strongest anchor; elsewhere use the exact registered name plus
the primary domain.

Then treat every subsequent discovery as guilty until proven linked. A GitHub org,
a Trustpilot page, an X account, a Crunchbase entry — each must connect back to
the anchor by something structural: the org's `blog` field pointing at the known
domain, a repo referencing the known product, an ATS slug matching the CNPJ.

Two real failures from the worked example below: an Indian industrial-chemicals
company owns `innovacorporate.com` and publishes a `sales@` address that looks
exactly like a valid contact; and a European hospitality-tech company owns
`github.com/innspire`, whose repos would have been cited as the target's stack.
Both were one careless step from entering a dossier as fact.

## Where things live

```
generated/recon/<company-slug>.md     dossier + approach, one file per company
```

`generated/` is gitignored. Recon output holds third-party contact details and
should not be committed, published to the site, or pasted into a shared channel.

## The scans

Run them in order — each one narrows what the next should look for. Do the
independent fetches in parallel; do not serialise what can be batched.

### 1. Identity

Establish the anchor. Registered name, trading names, CNPJ (or local equivalent),
founding year, headquarters and branches, headcount, and the **brand structure** —
a holding with operating brands behaves very differently from a single company,
and the brands are usually where the real activity is.

### 2. Digital surface

Enumerate every domain and subdomain the company touches: the institutional site,
each brand's site, the blog, the docs, the status page, the ATS. Build the list
from search, then from the sites' own outbound links, then from the link-in-bio
service if their social profiles use one (Linktree pages routinely expose internal
URLs that are linked nowhere else).

### 3. Channel health — where the pain is loudest

Test whether the company can actually be reached. This is the single highest-yield
scan and the one nobody else runs.

```bash
# Does the domain even accept mail?
Resolve-DnsName -Name example.com.br -Type MX        # PowerShell
dig +short MX example.com.br                          # POSIX

# Which routes are alive, and what do they leak?
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
for p in "" contato sobre quem-somos carreiras sitemap.xml; do
  code=$(curl -sL --max-time 20 -A "$UA" -o page.html -w "%{http_code}" "https://example.com.br/$p")
  echo "/$p -> $code"
  grep -oEi "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}" page.html | sort -u
  grep -oiE "wa\.me/[0-9]+|api\.whatsapp\.com/send\?phone=[0-9]+" page.html | sort -u
done
```

Read the combination, not the parts. **Live MX plus a dead published address**
means the mailbox is abandoned, not the domain — a precise, defensible finding.
A 500 on `/contato` while the brand sites are healthy means the holding is a shell
and the operation moved. Note that many hosts return 406/403 to bare `curl`;
send a full browser User-Agent before concluding a site is down.

Anything found here is perishable. Timestamp it.

### 4. GitHub

Use `gh` — the API tells you things the web UI buries.

```bash
gh api orgs/ORG --jq '{login,name,blog,email,location,public_repos,created_at}'
gh api "orgs/ORG/repos?per_page=100&sort=updated" \
  --jq '.[] | "\(.name) | \(.language // "-") | push:\(.pushed_at[0:10]) | \(.description // "")"'
gh api orgs/ORG/public_members --jq '.[].login'
```

Confirm the org against the anchor (the `blog` field usually settles it), then
read for:

- **What is alive versus dormant.** One repo pushed this quarter among five dead
  since 2021 tells you exactly where the company's attention is.
- **The real stack**, which is frequently not the stack in the job posting.
- **Hiring-challenge repos.** These are gold: they state the stack, the domain,
  the values, and the exact bar. List the directory contents, not just the README —
  challenges for levels that are *not linked from the index* are common, and a
  recently-created unlinked senior challenge is a strong signal about what they
  are quietly trying to hire.
- **Maintainers.** Commit authors on the active repos are the people who will
  evaluate Daniel's work. Names, not just handles.

```bash
gh api repos/ORG/REPO/contents --jq '.[] | "\(.type) \(.name)"'
gh api "repos/ORG/REPO/commits?per_page=10" \
  --jq '.[] | "\(.commit.author.date[0:10]) | \(.commit.author.name) | \(.commit.message | split("\n")[0])"'
```

### 5. Hiring surface

Find the ATS (Solides, Gupy, Greenhouse, Ashby, Lever) and read the board.

Open roles tell you where money is going. **Zero open roles is equally
informative** — it means there is no queue to join, which removes the "wait for a
posting" option and *justifies* a direct approach rather than undermining it. A
talent-bank-only page says they expect inbound but are not processing it.

### 6. What they publish

Their blog, their case studies, their social content. This answers the question
the About page never does: **who is their customer?** An approach that names the
customer's problem lands differently from one that names the company's.

### 7. The decider

Identify who can say yes, and read their register before writing a word to them.

- **A business decider** (CEO, founder, commercial director) needs revenue,
  funnel, delivery speed, risk. Technical detail loses them.
- **A technical decider** (CTO, tech lead, the active maintainer) needs the
  architecture, the numbers, the tradeoff. Business framing reads as fluff.

Prefer the channel where they are demonstrably *active* — a CEO posting weekly on
LinkedIn is more reachable there than at any address on the website. Note public
commitments (talks, board seats, columns, associations); they reveal the agenda
that a good approach attaches itself to.

**Stay professional and public.** Use business channels, business roles, and
public professional activity. Do not compile personal details, home addresses,
family, or private accounts — that is not recon, and it destroys the approach the
moment it shows. If a scan surfaces a genuine security exposure (a leaked
credential, a public bucket, an exposed `.env`), the only correct move is to
report it plainly and privately; never use it as leverage and never demonstrate it.

## Cross-reference the Corpus

Now read `content/` and find where Daniel's record meets what you found. The
strongest approach is not "I would be good at this" — it is **"the thing you are
screening for, I already built and ran."**

Look for, in descending order of force:

1. **A shipped system that matches their hiring challenge or core product.** This
   is the strongest card in the deck. Their challenge describes a spec; a
   Featured Accomplishment describes the same system with production usage
   numbers attached.
2. **A metric answering a pain the scans exposed.** Slow delivery cycles, quality
   problems, a team that cannot ship — match against Accomplishments carrying
   before/after numbers.
3. **Domain overlap.** Same industry, same customer type, same class of system.
4. **Locality and network.** Same city, shared association, shared community.

Use only Accomplishments that carry a `metric`. Drafts are excluded here for the
same reason they are excluded from a Selection: an approach must never imply a
result it cannot back. Cite the numbers exactly as the Corpus states them.

## Write the approach

One email. Not three variants for Daniel to choose between — pick the strongest
angle and commit, offering alternate subject lines only.

**Structure that works:**

1. **Open with proof or with a gift**, never with a request. Either the thing you
   already built that matches their bar, or a problem of theirs you just solved
   for free. The first two lines decide whether the rest is read.
2. **Translate every technical finding into their currency.** "`/contato` returns
   500" is a bug report. "The lead who just read your Curva ABC post gives up
   before reaching you" is a business problem. Same fact; only the second one
   moves a CEO.
3. **Evidence in the middle, exact numbers from the Corpus**, three or four at
   most. Usage numbers beat implementation detail with a business decider.
4. **Name the absence of a posting when there is none**, and go anyway. This is
   what moves Daniel out of the applicant pile and into a peer conversation. It
   only works because it is *true* — verify the board is empty before claiming it.
5. **Ask small.** Twenty minutes, a coffee, one reply. Never an interview, never
   an attached résumé — an attachment converts the exchange back into a screening
   process, which is precisely what the approach exists to bypass.
6. **Put the free finding in a P.S.** if it is not the opener. The P.S. is the
   most-read line in a cold email after the first sentence.

**Keep it under about 200 words in the body.** Every sentence either proves
something or asks for the meeting.

Write in the language the recipient works in — Brazilian Portuguese for a
Brazilian company, regardless of the Corpus being English
([ADR-0005](../../../docs/adr/0005-english-as-the-corpus-language.md) governs the
Corpus, not correspondence). Translate the Corpus metrics; do not restate them
loosely.

## Findings expire

Recon has a shelf life measured in days, and the most persuasive findings are the
most perishable. A broken contact page gets fixed. An unlinked challenge file gets
linked. An empty job board fills. Each of those, if it turns stale between writing
and sending, converts Daniel's sharpest line into a demonstrable error.

So every dossier ends with a **re-verification checklist** naming each
time-sensitive claim that appears in the approach and the exact command or URL
that re-checks it. Tell Daniel plainly: run this immediately before sending.

## The file

Write `generated/recon/<company-slug>.md` with these sections in order:

- **Subject line**, plus two alternates
- **Body**, in a fenced block, ready to paste
- **Why this angle** — the reasoning, so Daniel can defend or adapt it live
- **Dossier** — identity, deciders, stack, GitHub, hiring surface, working
  channels; every line marked CONFIRMADO or INFERIDO
- **Traps** — homonyms and dead ends found, so nobody re-walks them
- **Re-verification checklist**

## Verify before you're done

- Every fact in the approach body traces to a scan you ran or a Corpus file you
  read. No INFERIDO findings crossed into the email.
- The identity anchor holds for every surface cited — no homonym slipped in.
- Corpus numbers match `content/` exactly, and no draft was used.
- The re-verification checklist covers every perishable claim in the body.
- The dossier names the traps, including any confidently-wrong source.

## Worked example — Innova Corporate (2026-08)

Daniel wanted to reach a Criciúma software house. The posting-shaped path was a
dead end; the recon path was not.

**What the scans found.** Identity anchored on CNPJ 24.779.780/0001-88 — a
holding (Innova Corporate S/A) over two operating brands, InnSpire.dev and
InnCash. Channel health was the first break: MX records were live on every domain,
yet the address published on the holding's own site did not receive, `/contato`
returned 500, and the home route failed to render — while both brand sites were
healthy. Diagnosis: the holding is a shell, the operation moved to the brands, and
their institutional funnel is silently dropping inbound.

GitHub anchored via the org's `blog` field. Five repos dormant since 2021-2022,
one alive: a hiring-challenge repo pushed four months earlier. Its directory
listing carried a `senior.md` **absent from the README index**, created seven
months prior — and that file specified an API for project and task management,
multi-user, access levels, task status and assignee, with reports by status and
by user. The ATS showed zero open roles, talent bank only.

**The Corpus match.** Homeet — a Featured, multi-tenant work-management platform —
is that specification, already in production: 1,088 active cards across 29 active
projects, 76.3% of registered organisations active. The reports their challenge
requests as a requirement were metrics Daniel had already measured.

**The approach.** Opened on the unlinked senior challenge and the system already
running against it — proof, not promise. Middle carried four usage numbers plus
the iForth delivery metric (4 days to 1, +200% output). Named the empty job board
and went anyway. Asked for twenty minutes. The broken funnel went to the P.S.,
framed as lost leads rather than as an HTTP status.

**The traps.** `innovacorporate.com` (no `.br`) belongs to an Indian chemicals
company whose `sales@` address reads as a plausible contact; `github.com/innspire`
belongs to an unrelated European company whose C# repos would have been cited as
the target's stack. An aggregator supplied a per-person email pattern that was
recorded as INFERIDO and deliberately kept out of the email.

**The checklist.** Two claims in the body were perishable — the broken funnel and
the unlinked `senior.md` — and both were flagged for re-checking immediately
before sending, because either one being quietly fixed would turn the sharpest
line in the email into a visible error.
