import MyCoinsComponent from "@/components/MyCoinsComponent";

export async function generateMetadata() {
  return {
    title: `Komicats | My Coins`,
    description: `Welcome to Komicats's profile.`,
  };
}

export default function MyCoinsPage() {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      <MyCoinsComponent />;
    </div>
  );
}
