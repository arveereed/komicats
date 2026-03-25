import MyCoinsComponent from "@/components/MyCoinsComponent";

export async function generateMetadata() {
  return {
    title: `Komicats | My Coins`,
    description: `Welcome to Komicats's profile.`,
  };
}

export default function MyCoinsPage() {
  return <MyCoinsComponent />;
}
