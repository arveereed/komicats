import DownloadsPageComponent from "@/components/DownloadsComponent";

export async function generateMetadata() {
  return {
    title: `Komicats | Downloads`,
    description: `Welcome to Komicats's profile.`,
  };
}

export default function DownloadsPage() {
  return (
    <div className="relative pb-24 z-10 max-w-7xl mx-auto px-4 py-8">
      <DownloadsPageComponent />
    </div>
  );
}
