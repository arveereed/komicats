"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSignIn } from "@clerk/nextjs/legacy";

export default function ForgotPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ password visibility

  useEffect(() => {
    if (isSignedIn) router.replace("/");
  }, [isSignedIn]);

  if (!isLoaded) return null;

  async function sendResetCode(e?: React.FormEvent) {
    e?.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await signIn!.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStage("reset");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.message ||
        "Failed to send reset code";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitNewPassword(e?: React.FormEvent) {
    e?.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (!result) throw new Error("No result from Clerk");

      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        router.replace("/");
      } else if (result.status === "needs_second_factor") {
        setError("2FA required but not handled in this example.");
      } else {
        setError(`Unexpected status: ${result.status}`);
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.message ||
        "Failed to reset password";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative">
      {/* 🔙 Back to Sign In */}
      <button
        onClick={() => router.replace("/auth/sign-in")}
        className="absolute cursor-pointer top-6 left-6 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">
          Forgot Password
        </h1>

        {stage === "request" && (
          <form onSubmit={sendResetCode} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button disabled={isSubmitting} className="w-full cursor-pointer">
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        )}

        {stage === "reset" && (
          <form onSubmit={submitNewPassword} className="space-y-5">
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              We sent a reset code to{" "}
              <span className="font-semibold">{email}</span>. Enter it along
              with your new password.
            </p>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reset Code
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  value={password}
                  type={showPassword ? "text" : "password"} // ✅ toggle type
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex items-center gap-3">
              <Button disabled={isSubmitting} className="w-full cursor-pointer">
                {isSubmitting ? "Resetting…" : "Reset Password"}
              </Button>

              <Button
                onClick={() => setStage("request")}
                className="cursor-pointer"
                variant="secondary"
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
