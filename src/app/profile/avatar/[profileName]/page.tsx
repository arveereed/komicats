import { getAllComics } from "@/actions/comic.action";
import HomePageComponent from "@/components/HomeComponent";

export async function generateMetadata() {
  return {
    title: "Komicats | Profile",
    description: "Welcome to Komicats's profile.",
  };
}

export default async function HomePage() {
  const comics = await getAllComics();

  return (
    <div className="relative z-10 pb-20 max-w-7xl mx-auto px-4">
      <HomePageComponent comics={comics} />
    </div>
  );
}
