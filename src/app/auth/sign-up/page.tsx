"use client";

import { useEffect, useState } from "react";
import { XCircle, AlertCircle, EyeOff, Eye, Facebook } from "lucide-react"; // optional icons
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import VerifyEmailUI from "../components/VerifyEmailUI";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function SignupForm() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
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
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  // Move the navigation logic here
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/profile/avatar");
    }
  }, [userLoaded, isSignedIn, router]);

  // Rest of your component logic...
  if (!userLoaded || !isLoaded) return <div>Loading...</div>;

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

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

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
        unsafeMetadata: {
          fullname,
        },
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setIsLoading(false);
      setError("");
      setPendingVerification(true);
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
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
      }
      setIsLoading(false);
      // console.error(JSON.stringify(err, null, 2));
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        /* const userData = {
          user_id: signUpAttempt.createdUserId as string,
          fullname: signUpAttempt.unsafeMetadata.fullname as string,
          email: signUpAttempt.emailAddress as string,
        };
        addUser(userData); */

        router.replace("/profile/avatar");
        setIsLoading(false);
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        setIsLoading(false);

        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      if (err.errors?.[0]?.code === "too_many_requests") {
        setError("Too many requests. Please try again in a bit.");
      } else if (err.errors?.[0]?.code === "form_param_nil") {
        setError("Enter a code");
      } else if (err.errors?.[0]?.code === "form_code_incorrect") {
        setError("The code is incorrect");
      }
      setIsLoading(false);

      // console.error(JSON.stringify(err, null, 2));
    }
  };

  const onFacebookSignUp = async () => {
    if (!isLoaded || !signUp) return;

    try {
      setError(null);
      setIsFacebookLoading(true);

      await signUp.authenticateWithRedirect({
        strategy: "oauth_facebook",
        redirectUrl: "/auth/sso-callback", // 👈 callback page
        redirectUrlComplete: "/profile/avatar", // 👈 success → home
      });
    } catch (err) {
      console.error(err);
      setError("Facebook sign up failed.");
    } finally {
      setIsFacebookLoading(false);
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
    <>
      {/* Use min-h-svh to account for mobile browser toolbars and added vertical padding */}
      <div className="flex min-h-svh flex-col justify-center p-4 sm:p-8 bg-gray-50">
        {/* Adjusted max-width and internal padding for mobile vs desktop */}
        <div className="max-w-md w-full mx-auto border border-gray-200 rounded-2xl p-6 sm:p-10 bg-white shadow-sm">
          <h1 className="text-slate-900 text-center text-2xl sm:text-3xl font-semibold">
            Sign up
          </h1>

          {error && (
            <div className="flex items-start justify-between bg-red-500 text-white p-3 rounded-lg my-6">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              <button className="cursor-pointer" onClick={() => setError("")}>
                <XCircle size={20} />
              </button>
            </div>
          )}

          {/* FACEBOOK */}
          <div className="mt-8">
            <button
              onClick={onFacebookSignUp}
              disabled={isFacebookLoading}
              className="w-full flex items-center justify-center gap-2 border border-slate-300 rounded-md py-3 px-4 text-slate-900 font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              <Facebook size={18} />
              {isFacebookLoading ? "Connecting..." : "Continue with Facebook"}
            </button>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider">
              or
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <form className="mt-8">
            <div className="space-y-5">
              {/* Fullname */}
              <div>
                <label
                  htmlFor="fullname"
                  className="text-sm font-medium text-slate-900 mb-1.5 block"
                >
                  Fullname
                </label>
                <input
                  id="fullname"
                  type="text"
                  placeholder="Enter fullname"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="border border-gray-300 w-full text-sm px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-900 mb-1.5 block"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="border border-gray-300 w-full text-sm px-4 py-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-900 mb-1.5 block"
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
                    className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-10 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="cpassword"
                  className="text-sm font-medium text-slate-900 mb-1.5 block"
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
                    className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-10 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    placeholder="Enter confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCPassword((prev) => !prev)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                  >
                    {/* Fixed logic to check showCPassword specifically */}
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
                className="bg-black text-white hover:bg-neutral-800 shadow-sm hover:shadow-md cursor-pointer w-full py-3 px-4 text-sm font-medium rounded-md transition-all active:scale-[0.98] disabled:bg-neutral-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create an account"}
              </button>

              <div
                id="clerk-captcha"
                data-cl-theme="dark"
                data-cl-size="flexible"
                data-cl-language="en-US"
              />
            </div>

            <p className="text-center text-sm text-slate-600 mt-6">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="text-blue-600 font-semibold hover:underline ml-1"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
