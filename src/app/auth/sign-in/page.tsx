"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { AlertCircle, Eye, EyeOff, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function page() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ password visibility
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSignInPress = async () => {
    if (!signIn || !setActive) {
      return;
    }
    try {
      setIsLoading(true);
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // navigate("/");
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === "form_password_incorrect") {
        setError("Password is incorrect. Please try again.");
      } else if (err.errors?.[0]?.code === "form_param_format_invalid") {
        setError("Email address must be valid.");
      } else if (err.errors?.[0]?.code === "form_identifier_not_found") {
        setError("Email doesn't exist. Please try again.");
      } else if (
        err.errors?.[0]?.code === "form_param_nil" ||
        err.errors?.[0]?.code === "form_conditional_param_missing"
      ) {
        setError("Email or password is empty.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-[480px] w-full">
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <h1 className="text-slate-900 text-center text-3xl font-semibold">
            Sign in
          </h1>

          {error && (
            <div className="flex items-center justify-between bg-red-500 text-white p-3 rounded-lg mt-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
              <button className="cursor-pointer" onClick={() => setError("")}>
                <XCircle size={20} />
              </button>
            </div>
          )}

          <form className="mt-12 space-y-6">
            {/* Email */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Email
              </label>
              <input
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                name="username"
                type="text"
                required
                className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 rounded-md outline-blue-600"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-900 text-sm font-medium mb-2 block">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  type={showPassword ? "text" : "password"} // ✅ toggle type
                  required
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-10 rounded-md outline-blue-600"
                  placeholder="Enter password"
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

            {/* Remember & Forgot */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-3 block text-sm text-slate-900"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  href="/forgotpassword"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="!mt-12">
              <button
                disabled={isLoading}
                onClick={onSignInPress}
                type="button"
                className="bg-black text-white hover:bg-neutral-800 shadow-sm hover:shadow-md disabled:bg-neutral-400 w-full py-2 px-4 text-[15px] font-medium tracking-wide rounded-md focus:outline-none cursor-pointer"
              >
                {isLoading ? "Loading..." : "Sign in"}
              </button>
            </div>

            <p className="text-slate-900 text-sm !mt-6 text-center">
              Don't have an account?{" "}
              <Link
                className="text-blue-600 font-medium hover:underline ml-1"
                href="/register"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
