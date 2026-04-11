"use client";

import { useEffect, useState } from "react";
import { XCircle, AlertCircle, EyeOff, Eye } from "lucide-react";
import { useSignUp } from "@clerk/nextjs/legacy";
import VerifyEmailUI from "../components/VerifyEmailUI";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Loading from "./loading";

export default function SignupForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [code, setCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;

  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/profile/avatar");
    }
  }, [userLoaded, isSignedIn, router]);

  if (!userLoaded || !isLoaded) {
    return Loading();
  }

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);

    if (!emailAddress || !confirmPassword || !password || !fullname) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await signUp.create({
        emailAddress,
        password,
        unsafeMetadata: {
          fullname,
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setIsLoading(false);
      setError(null);
      setPendingVerification(true);
    } catch (err: any) {
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        setError("That email address is taken. Please try another.");
      } else if (err.errors?.[0]?.code === "form_param_format_invalid") {
        setError("Email address must be a valid email address.");
      } else if (err.errors?.[0]?.code === "form_param_nil") {
        setError("Email or password is empty");
      } else if (err.errors?.[0]?.code === "form_password_length_too_short") {
        setError("Passwords must be 8 characters or more.");
      } else if (err.errors?.[0]?.code === "form_password_pwned") {
        setError("Please use a different password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });

        if (emailAddress === adminEmail) window.location.href = "/admin";
        else window.location.href = "/profile/avatar";

        setIsLoading(false);
      } else {
        setIsLoading(false);
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === "too_many_requests") {
        setError("Too many requests. Please try again in a bit.");
      } else if (err.errors?.[0]?.code === "form_param_nil") {
        setError("Enter a code");
      } else if (err.errors?.[0]?.code === "form_code_incorrect") {
        setError("The code is incorrect");
      } else {
        setError("Verification failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <VerifyEmailUI
        pendingVerification={pendingVerification}
        isLoading={isLoading}
        error={error}
        setError={setError}
        code={code}
        setCode={setCode}
        onVerifyPress={onVerifyPress}
      />
    );
  }

  return (
    <div
      className="relative flex min-h-svh flex-col justify-center bg-cover bg-center bg-no-repeat px-4 py-12 text-white sm:px-8"
      style={{ backgroundImage: "url('/BACKGROUND.png')" }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Sign up
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Create your Komicats account
          </p>
        </div>

        {error && (
          <div className="my-6 flex items-start justify-between rounded-xl border border-red-400/20 bg-red-500/15 p-3 text-red-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
            <button
              className="cursor-pointer text-red-100/80 hover:text-white"
              onClick={() => setError("")}
              type="button"
            >
              <XCircle size={20} />
            </button>
          </div>
        )}

        <form className="mt-8">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="fullname"
                className="mb-2 block text-sm font-medium text-white/85"
              >
                Fullname
              </label>
              <input
                id="fullname"
                type="text"
                placeholder="Enter fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0b1a20]/80 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-teal-300/40 focus:ring-2 focus:ring-teal-300/20"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white/85"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0b1a20]/80 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-teal-300/40 focus:ring-2 focus:ring-teal-300/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-white/85"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-white/55 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="cpassword"
                className="mb-2 block text-sm font-medium text-white/85"
              >
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="cpassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  name="confirmPassword"
                  type={showCPassword ? "text" : "password"}
                  required
                  placeholder="Enter confirm password"
                  className="w-full rounded-xl border border-white/10 bg-[#0b1a20]/80 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-teal-300/40 focus:ring-2 focus:ring-teal-300/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-white/55 hover:text-white"
                >
                  {showCPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button
              type="button"
              disabled={isLoading}
              onClick={onSignUpPress}
              className="w-full rounded-xl bg-teal-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create an account"}
            </button>

            <div
              id="clerk-captcha"
              data-cl-theme="dark"
              data-cl-size="flexible"
              data-cl-language="en-US"
              className="mt-4"
            />
          </div>

          <p className="mt-6 text-center text-sm text-white/65">
            Already have an account?
            <Link
              href="/auth/sign-in"
              className="ml-1 font-semibold text-teal-300 transition hover:text-teal-200 hover:underline"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
