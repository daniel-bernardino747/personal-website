import { NextRequest, NextResponse } from "next/server";

// TODO: This API route is a stub only.
//
// Because `output: 'export'` is set in next.config.mjs, this route is
// excluded from the static build and will NOT be available in the exported
// `out/` directory. It works only during `npm run dev`.
//
// To make the guestbook functional in production you have a few options:
//   1. Remove `output: 'export'` and deploy to a Node.js host (Vercel, Railway)
//      that supports serverless functions, then implement persistence here
//      (e.g. with a Vercel KV store or a database via Prisma).
//   2. Keep static export and replace this route with a third-party service
//      (e.g. a form backend like Formspree, or a direct Supabase REST call
//      from the client component).
//   3. Keep static export and store entries in a GitHub file via the GitHub
//      API, triggering a rebuild on each submission.

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, message } = body;

  // Validate
  if (!name || !message) {
    return NextResponse.json(
      { ok: false, error: "name and message are required" },
      { status: 400 }
    );
  }

  // TODO: Persist the entry (database, KV store, etc.)
  console.log("Guestbook entry received:", { name, message });

  return NextResponse.json({ ok: true });
}
