"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ShopComponent() {
  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();
  const router = useRouter();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;

  // Move the navigation logic here
  useEffect(() => {
    if (userLoaded && isSignedIn && !isAdmin) {
      router.push("/profile/avatar/shop");
    }
    if (isAdmin) {
      router.push("/admin");
    }
  }, [userLoaded, isSignedIn, router, isAdmin]);

  return <div>ShopComponent</div>;
}
