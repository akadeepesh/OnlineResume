import { createAuthClient } from "better-auth/react";

/** Better Auth in the browser. Same origin, so no base URL needed. */
export const authClient = createAuthClient();
