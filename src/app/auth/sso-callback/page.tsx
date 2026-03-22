"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    />
  );
}
