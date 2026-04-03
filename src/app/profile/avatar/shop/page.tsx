import ShopComponent from "@/components/ShopComponent";

export async function generateMetadata() {
  return {
    title: `Komicats | Shop`,
    description: `Welcome to Komicats's profile.`,
  };
}

export default function ShopPage() {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      <ShopComponent />
    </div>
  );
}
