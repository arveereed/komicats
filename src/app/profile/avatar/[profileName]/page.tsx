import HomePageComponent from "@/components/HomeComponent";

export async function generateMetadata() {
  return {
    title: `Komicats | Profile`,
    description: `Welcome to Komicats's profile.`,
  };
}

export default function HomePage() {
  return <HomePageComponent />;
}
