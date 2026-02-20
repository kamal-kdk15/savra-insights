// NextAuth catch-all route handler.
// All config lives in lib/auth.ts — this file just wires it up.

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
