import { getAuth } from "@/lib/auth/server";

// Every Better Auth endpoint: sign-in/up/out, OAuth redirects and callbacks, session.
const handler = (request: Request) => getAuth().handler(request);

export { handler as GET, handler as POST };
