import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { getIdentity } from "@/lib/corpus/site";
import { SITE_URL } from "@/lib/site-url";

/**
 * The card a link to the site unfolds into on LinkedIn, WhatsApp, X and Slack.
 * It applies to every route — pages only change the title and description
 * beside it — and it is drawn from the Identity, so a new role or headline
 * reaches the preview with a `content/` edit and a deploy, never a redesign.
 *
 * Rendered once at build: nothing here reads the request.
 */
export const dynamic = "force-static";
export const alt = "Daniel Bernardino de Souza — portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The site's own palette, as hex: `next/og` does not parse oklch.
const BACKGROUND = "#09090b";
const FOREGROUND = "#fafafa";
const MUTED = "#a1a1aa";
const ACCENT = "#00bc7d";

export default async function OpengraphImage() {
  const identity = getIdentity();

  // `next/og` bundles only a regular Noto Sans, and the name needs the Hero's
  // weight. Static Geist cuts sit beside the variable fonts the site loads,
  // because the renderer cannot read a variable font.
  const [regular, bold, avatar] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fonts/Geist-400.ttf")),
    readFile(join(process.cwd(), "src/app/fonts/Geist-700.ttf")),
    readFile(join(process.cwd(), "public/images/avatar.png")),
  ]);
  const avatarSrc = `data:image/png;base64,${avatar.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          background: BACKGROUND,
          fontFamily: "Geist",
          color: FOREGROUND,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.035em" }}>
            <span>Hi, I&apos;m</span>
            <span style={{ color: ACCENT }}>{identity.name}</span>
          </div>

          {/* One unbreakable span per role, so a line wraps between roles and
              never inside one. The separator trails its role, so no line opens with a dot. */}
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 36, fontSize: 30, color: MUTED }}>
            {identity.role.map((role, index) => (
              <span key={role} style={{ whiteSpace: "nowrap", marginRight: 12 }}>
                {index < identity.role.length - 1 ? `${role} ·` : role}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", marginTop: 56, fontSize: 24, color: MUTED }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: ACCENT, marginRight: 14 }} />
            {SITE_URL.host.replace(/^www\./, "")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 340,
            height: 340,
            borderRadius: 999,
            background: "#18181b",
            border: `2px solid rgba(0,188,125,0.35)`,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by satori, not the browser */}
          <img src={avatarSrc} width={300} height={300} alt="" />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
