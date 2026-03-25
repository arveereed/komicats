import ShopComponent from "@/components/ShopComponent";

export async function generateMetadata() {
  return {
    title: `Komicats | Shop`,
    description: `Welcome to Komicats's profile.`,
  };
}

export default function ShopPage() {
  return <ShopComponent />;
}
