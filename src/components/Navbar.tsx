import Link from "next/link";
import { Button } from "./ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";

export default async function Navbar() {
  const user = await currentUser();

  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center ">
            <Link
              href="/"
              className="text-xl font-bold text-primary font-mono tracking-wider"
            >
              Komicats
            </Link>
          </div>

          {user ? (
            <SignOutButton redirectUrl="/auth/sign-in">
              <Button variant="ghost">Sign out</Button>
            </SignOutButton>
          ) : (
            <div className="space-x-4">
              {/* <SignInButton mode="modal">
                <Button variant="default">Sign in clerk</Button>
              </SignInButton> */}
              <Link href="/auth/sign-in">
                <Button variant="default">Sign in</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="ghost">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
