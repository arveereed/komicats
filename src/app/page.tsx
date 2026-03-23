"use client";

import { useUser } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { isLoaded, signIn, setActive } = useSignIn();

  // Move the navigation logic here
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/profile/avatar");
    }
  }, [userLoaded, isSignedIn, router]);

  // Rest of your component logic...
  if (!userLoaded || !isLoaded) return <div>Loading...</div>;

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1>
        Welcome to Komicats showcase page, this will edited in the future!
      </h1>
    </div>
  );
}
