/**
 * What Sentry may collect: nothing about the person. Error reports keep the
 * message and stack trace, but no user info, cookies, headers, request or
 * response bodies, or URL query parameters (which can hold tokens).
 */
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
} as const;
