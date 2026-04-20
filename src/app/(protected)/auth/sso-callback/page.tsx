"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

const SIGN_IN_URL = "/auth/sign-in";
const SIGN_UP_URL = "/auth/sign-up";
const DEFAULT_AFTER_AUTH_URL = "/profile/avatar";

export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInUrl={SIGN_IN_URL}
      signUpUrl={SIGN_UP_URL}
      signInForceRedirectUrl={DEFAULT_AFTER_AUTH_URL}
      signUpForceRedirectUrl={DEFAULT_AFTER_AUTH_URL}
      signInFallbackRedirectUrl={DEFAULT_AFTER_AUTH_URL}
      signUpFallbackRedirectUrl={DEFAULT_AFTER_AUTH_URL}
    />
  );
}
