import { DevdarianiExperience } from "@/components/devdariani-v2/DevdarianiExperience";
import { copy } from "@/lib/devdariani-v2/copy";

type HomePageProps = {
  searchParams: Promise<{ debug3d?: string }>;
};

export const metadata = {
  description: "DEVDARIANI — The Art of Orchestrics™. Engineering the Whole.",
  title: "DEVDARIANI",
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <DevdarianiExperience
      copy={copy.en}
      debug={resolvedSearchParams.debug3d === "1"}
      locale="en"
    />
  );
}
