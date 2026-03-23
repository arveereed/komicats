export async function generateMetadata({
  params,
}: {
  params: Promise<{ profileName: string }>;
}) {
  const { profileName } = await params;

  return {
    title: `Profile | ${profileName.split("%3D")[1]}`,
    description: `Check out ${profileName}'s profile.`,
  };
}

export default function HomePage() {
  return <div>HomePage</div>;
}
