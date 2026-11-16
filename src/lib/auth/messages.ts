// ============================================================================
// Friendly copy for Better Auth's error codes. Unknown codes get a generic
// message, so a library update never shows people a raw code.
// ============================================================================

const ALREADY_EXISTS = "There's already an account with this email. Sign in instead.";
const OTHER_METHOD =
  "This email already has an account with a different sign-in method. Sign in the way you did before.";
const EXPIRED = "That sign-in attempt expired. Please try again.";

const MESSAGES: Record<string, string> = {
  // Email + password (API error codes)
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match.",
  USER_ALREADY_EXISTS: ALREADY_EXISTS,
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: ALREADY_EXISTS,
  INVALID_EMAIL: "That doesn't look like an email address.",
  PASSWORD_TOO_SHORT: "Use at least 8 characters for your password.",
  PASSWORD_TOO_LONG: "That password is too long (128 characters max).",
  TOO_MANY_REQUESTS: "Too many attempts. Wait a minute and try again.",
  // OAuth callback (?error= on the sign-in page)
  ACCOUNT_NOT_LINKED: OTHER_METHOD,
  UNABLE_TO_LINK_ACCOUNT: OTHER_METHOD,
  EMAIL_NOT_FOUND: "That account has no email we can use. Try another sign-in method.",
  EMAIL_NOT_VERIFIED: "Verify your email with that provider first, then try again.",
  ACCESS_DENIED: "Sign-in was cancelled.",
  STATE_MISMATCH: EXPIRED,
  STATE_NOT_FOUND: EXPIRED,
  PLEASE_RESTART_THE_PROCESS: EXPIRED,
};

export const GENERIC_AUTH_ERROR = "Something went wrong. Please try again.";

/** "account not linked" / "account_not_linked" / "ACCOUNT_NOT_LINKED" → ACCOUNT_NOT_LINKED */
const normalize = (code: string) => code.trim().replace(/[\s-]+/g, "_").toUpperCase();

export function authErrorMessage(code: string | null | undefined): string {
  if (!code) return GENERIC_AUTH_ERROR;
  return MESSAGES[normalize(code)] ?? GENERIC_AUTH_ERROR;
}
