"use client";

import { useUser } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { AlertCircle, Eye, EyeOff, XCircle, Facebook } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SigninForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsSecondFactor, setNeedsSecondFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  if (!userLoaded || !isLoaded) return <div>Loading...</div>;

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

      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await redirectAfterLogin(signInAttempt.createdSessionId);
        return;
      }

      if (signInAttempt.status === "needs_second_factor") {
        setNeedsSecondFactor(true);

        const emailSecondFactor = signInAttempt.supportedSecondFactors?.find(
          (factor) => factor.strategy === "email_code",
        );

        setInfo(
          emailSecondFactor?.safeIdentifier
            ? `We sent a verification code to ${emailSecondFactor.safeIdentifier}.`
            : "Enter the verification code sent to your email.",
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
      const code = err?.errors?.[0]?.code;

      if (code === "form_password_incorrect") {
        setError("Password is incorrect. Please try again.");
      } else if (code === "form_param_format_invalid") {
        setError("Email address must be valid.");
      } else if (code === "form_identifier_not_found") {
        setError("Email doesn't exist. Please try again.");
      } else if (
        code === "form_param_nil" ||
        code === "form_conditional_param_missing"
      ) {
        setError("Email or password is empty.");
      } else {
        setError("Something went wrong. Please try again.");
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
        code,
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
      const code = err?.errors?.[0]?.code;

      if (code === "form_code_incorrect" || code === "verification_failed") {
        setError("Invalid verification code. Please try again.");
      } else if (code === "form_param_nil") {
        setError("Verification code is required.");
      } else if (code === "verification_expired") {
        setError("Verification code expired. Please sign in again.");
        setNeedsSecondFactor(false);
        setCode("");
      } else {
        setError("Failed to verify the code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onFacebookSignIn = async () => {
    if (!isLoaded || !signIn) return;

    try {
      setError(null);
      setIsFacebookLoading(true);

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
  };

  return (
    <div className="flex items-center justify-center min-h-svh px-4 py-12 bg-slate-50">
      <div className="max-w-[480px] w-full">
        <div className="p-6 sm:p-10 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h1 className="text-slate-900 text-center text-2xl sm:text-3xl font-semibold">
            {needsSecondFactor ? "Verify your email" : "Sign in"}
          </h1>

          {error && (
            <div className="flex items-start justify-between bg-red-500 text-white p-3 rounded-lg mt-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              <button className="cursor-pointer" onClick={() => setError(null)}>
                <XCircle size={20} />
              </button>
            </div>
          )}

          {info && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mt-4 text-sm">
              {info}
            </div>
          )}

          {!needsSecondFactor ? (
            <>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={onFacebookSignIn}
                  disabled={isFacebookLoading}
                  className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-md py-3 px-4 text-slate-900 font-medium hover:bg-slate-50 disabled:opacity-60 cursor-pointer transition-colors"
                >
                  <Facebook size={18} />
                  <span className="text-sm sm:text-base">
                    {isFacebookLoading
                      ? "Connecting..."
                      : "Continue with Facebook"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider">
                  or
                </span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSignInPress();
                }}
              >
                <div>
                  <label className="text-slate-900 text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <input
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    name="username"
                    type="email"
                    required
                    className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="text-slate-900 text-sm font-medium mb-2 block">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-10 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-slate-700 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    disabled={isLoading}
                    type="submit"
                    className="bg-black text-white hover:bg-neutral-800 shadow-sm hover:shadow-md disabled:bg-neutral-400 w-full py-3 px-4 text-[15px] font-medium tracking-wide rounded-md focus:outline-none cursor-pointer transition-all"
                  >
                    {isLoading ? "Loading..." : "Sign in"}
                  </button>
                </div>

                <p className="text-slate-600 text-sm mt-6 text-center">
                  Don't have an account?{" "}
                  <Link
                    className="text-blue-600 font-semibold hover:underline ml-1"
                    href="/auth/sign-up"
                  >
                    Register here
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <form
              className="space-y-5 mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                onVerifySecondFactor();
              }}
            >
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Verification code
                </label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  required
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="Enter the code from your email"
                />
              </div>

              <div className="pt-2 space-y-3">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="bg-black text-white hover:bg-neutral-800 shadow-sm hover:shadow-md disabled:bg-neutral-400 w-full py-3 px-4 text-[15px] font-medium tracking-wide rounded-md focus:outline-none cursor-pointer transition-all"
                >
                  {isLoading ? "Verifying..." : "Verify code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNeedsSecondFactor(false);
                    setCode("");
                    setInfo(null);
                    setError(null);
                  }}
                  className="w-full py-3 px-4 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50 transition-all"
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
