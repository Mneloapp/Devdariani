import type { Metadata } from "next";
import { ShaftJourneyExperience } from "@/app/components/ShaftJourneyExperience";

export const metadata: Metadata = {
  title: "DEVDARIANI — Engineering the Whole",
  description:
    "Enter a coordinated MEP core, meet the engineering thinking behind Devdariani, and discover The Art of Orchestrics™.",
};

export default function Home() {
  return <ShaftJourneyExperience />;
}
