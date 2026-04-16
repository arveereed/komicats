"use client";

import { useUser } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { AlertCircle, Eye, EyeOff, XCircle, Facebook } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const REMEMBER_ME_KEY = "komicats_remember_me";
const REMEMBERED_EMAIL_KEY = "komicats_remembered_email";

export default function SigninForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  useEffect(() => {
    if (userLoaded && isSignedIn && !isAdmin) {
      router.push("/profile/avatar");
    }
    if (isAdmin) {
      router.push("/admin");
    }
  }, [userLoaded, isSignedIn, router, isAdmin]);

  useEffect(() => {
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";

    setRememberMe(savedRememberMe);

    if (savedRememberMe && savedEmail) {
      setEmailAddress(savedEmail);
    }
  }, []);

  const persistRememberMe = () => {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, "true");
      localStorage.setItem(REMEMBERED_EMAIL_KEY, emailAddress.trim());
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  };

  const redirectAfterLogin = async (sessionId: string | null) => {
    if (!sessionId || !setActive) return;

    await setActive({ session: sessionId });

    if (emailAddress === adminEmail) {
      window.location.href = "/admin";
    } else {
      window.location.href = "/profile/avatar";
    }
  };

  const onSignInPress = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setError(null);
      setInfo(null);
      setIsLoading(true);

      persistRememberMe();

      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await redirectAfterLogin(signInAttempt.createdSessionId);
        return;
      }

      if (signInAttempt.status === "needs_second_factor") {
        const emailSecondFactor = signInAttempt.supportedSecondFactors?.find(
          (factor) => factor.strategy === "email_code",
        );

        if (!emailSecondFactor) {
          setError("No supported email verification method was found.");
          return;
        }

        await signIn.prepareSecondFactor({
          strategy: "email_code",
        });

        setNeedsSecondFactor(true);
        setInfo(
          emailSecondFactor?.safeIdentifier
            ? `We sent a verification code to ${emailSecondFactor.safeIdentifier}.`
            : "We sent a verification code to your email.",
        );
        return;
      }

      console.error(
        "Unhandled sign-in status:",
        signInAttempt.status,
        signInAttempt,
      );
      setError("Sign-in needs an extra step that is not handled yet.");
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const errorCode = clerkError?.code;

      if (errorCode === "form_password_incorrect") {
        setError("Password is incorrect. Please try again.");
      } else if (errorCode === "form_param_format_invalid") {
        setError("Email address must be valid.");
      } else if (errorCode === "form_identifier_not_found") {
        setError("Email doesn't exist. Please try again.");
      } else if (
        errorCode === "form_param_nil" ||
        errorCode === "form_conditional_param_missing"
      ) {
        setError("Email or password is empty.");
      } else {
        setError(
          clerkError?.longMessage ||
            clerkError?.message ||
            "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySecondFactor = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setError(null);
      setInfo(null);
      setIsLoading(true);

      const secondFactorAttempt = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: code.trim(),
      });

      if (secondFactorAttempt.status === "complete") {
        await redirectAfterLogin(secondFactorAttempt.createdSessionId);
        return;
      }

      console.error(
        "Second-factor verification incomplete:",
        secondFactorAttempt,
      );
      setError("Verification could not be completed. Please try again.");
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const errorCode = clerkError?.code;

      if (errorCode === "verification_not_sent") {
        setError("A verification code has not been sent yet.");
      } else if (
        errorCode === "form_code_incorrect" ||
        errorCode === "verification_failed"
      ) {
        setError("Invalid verification code. Please try again.");
      } else if (errorCode === "form_param_nil") {
        setError("Verification code is required.");
      } else if (errorCode === "verification_expired") {
        setError("Verification code expired. Please sign in again.");
        setNeedsSecondFactor(false);
        setCode("");
      } else {
        setError(
          clerkError?.longMessage ||
            clerkError?.message ||
            "Failed to verify the code. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setError(null);
      setInfo(null);

      await signIn.prepareSecondFactor({
        strategy: "email_code",
      });

      setInfo("A new verification code has been sent to your email.");
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      setError(
        clerkError?.longMessage ||
          clerkError?.message ||
          "Failed to resend code.",
      );
    }
  };

  /*   const onFacebookSignIn = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setError(null);
      setIsFacebookLoading(true);

      persistRememberMe();

      const path = isAdmin ? "/admin" : "/profile/avatar";

      await signIn.authenticateWithRedirect({
        strategy: "oauth_facebook",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: path,
      });
    } catch (err: any) {
      console.error("Facebook sign in error:", err);
      setError("Facebook sign in failed. Please try again.");
    } finally {
      setIsFacebookLoading(false);
    }
  }; */

  return (
    <div
      className="relative flex min-h-svh items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-12 text-white"
      style={{ backgroundImage: "url('/BACKGROUND.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {needsSecondFactor ? "Verify your email" : "Sign in"}
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Welcome back to Komicats
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-start justify-between rounded-xl border border-red-400/20 bg-red-500/15 p-3 text-red-100">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              <button
                type="button"
                className="cursor-pointer text-red-100/80 hover:text-white"
                onClick={() => setError(null)}
              >
                <XCircle size={18} />
              </button>
            </div>
          )}

          {info && (
            <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
              {info}
            </div>
          )}

          {!needsSecondFactor ? (
            <>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSignInPress();
                }}
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Email
                  </label>
                  <input
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    name="username"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-white/10 bg-[#0b1a20]/80 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-teal-300/40 focus:ring-2 focus:ring-teal-300/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-white/10 bg-[#0b1a20]/80 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-teal-300/40 focus:ring-2 focus:ring-teal-300/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/55 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 shrink-0 rounded border-white/20 bg-transparent text-teal-400 focus:ring-teal-400"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block cursor-pointer text-sm text-white/70"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-teal-300 transition hover:text-teal-200 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full rounded-xl bg-teal-400 px-4 py-3 text-[15px] font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Loading..." : "Sign in"}
                  </button>
                </div>

                <p className="mt-6 text-center text-sm text-white/65">
                  Don't have an account?
                  <Link
                    className="ml-1 font-semibold text-teal-300 transition hover:text-teal-200 hover:underline"
                    href="/auth/sign-up"
                  >
                    Register here
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onVerifySecondFactor();
              }}
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Verification code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="Enter the code from your email"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1a20]/80 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-teal-300/40 focus:ring-2 focus:ring-teal-300/20"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full rounded-xl bg-teal-400 px-4 py-3 text-[15px] font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Verifying..." : "Verify code"}
                </button>

                <button
                  type="button"
                  onClick={onResendCode}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Resend code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNeedsSecondFactor(false);
                    setCode("");
                    setInfo(null);
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
