import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react"; // Optional: adding an icon

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      {/* Visual Indicator */}
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>

      {/* Typography */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 text-base text-muted-foreground max-w-prose">
        Sorry, we couldn’t find the page you’re looking for. It might have been
        moved, deleted, or perhaps it never existed in the first place.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Button asChild variant="default">
          <Link href="/">Return Home</Link>
        </Button>

        {/* Added a secondary action for better UX */}
        <Button asChild variant="ghost">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </main>
  );
}
