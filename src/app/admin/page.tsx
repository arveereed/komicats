import Link from "next/link";
import AdminAddNewComicComponent from "@/components/AdminAddNewComicComponent";
import ComicListSection from "@/components/admin/ComicListSection";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function AdminPage() {
  const clerkUser = await currentUser();
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;

  if (!isAdmin) {
    return notFound();
  }

  return (
    <section className="space-y-8 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-sm text-zinc-500">Manage comics and coin plans</p>
        </div>

        <Link
          href="/admin/plans"
          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Manage Plans
        </Link>
      </div>

      <AdminAddNewComicComponent />
      <ComicListSection />
    </section>
  );
}
