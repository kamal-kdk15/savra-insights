// ── FILE: middleware.ts ───────────────────────────────────────────────────────
// Protects all /dashboard routes.
// If no valid session → redirect to /login automatically.
// This runs on every request BEFORE the page renders — no flash of
// unauthenticated content.

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*"],
};
