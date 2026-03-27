import ComicListSection from "@/components/admin/ComicListSection";
import AdminAddNewComicComponent from "@/components/AdminAddNewComicComponent";

export default function AdminPage() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage comics and episodes
          </p>
        </div>
        <AdminAddNewComicComponent />
      </div>

      <ComicListSection />
    </div>
  );
}
