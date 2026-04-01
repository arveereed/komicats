import AdminAddNewComicComponent from "@/components/AdminAddNewComicComponent";
import ComicListSection from "@/components/admin/ComicListSection";
import { BookOpen, Shield, Sparkles } from "lucide-react";

export default function AdminPage() {
  return (
    <section className="">
      <div className="relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white/10 bg-black/30 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                  <Shield className="h-3.5 w-3.5" />
                  Admin Control Panel
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Comic Dashboard
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                  Manage comics, organize episodes, and keep your library styled
                  with the same immersive reading experience as the episode
                  reader.
                </p>
              </div>

              <div className="w-full sm:w-auto">
                <AdminAddNewComicComponent />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white/60">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">Library</span>
                </div>
                <p className="mt-2 text-lg font-semibold">All Comics</p>
                <p className="mt-1 text-sm text-white/50">
                  View and manage all uploaded titles.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm">Episodes</span>
                </div>
                <p className="mt-2 text-lg font-semibold">Reader Theme</p>
                <p className="mt-1 text-sm text-white/50">
                  Keep the admin side visually aligned with the reader UI.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-white/60">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Control</span>
                </div>
                <p className="mt-2 text-lg font-semibold">Quick Actions</p>
                <p className="mt-1 text-sm text-white/50">
                  Add new comics and manage content in one place.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Comic Library</h2>
                <p className="text-sm text-white/60">
                  Browse your collection in the same cinematic theme.
                </p>
              </div>
            </div>

            <ComicListSection />
          </div>
        </div>
      </div>
    </section>
  );
}
