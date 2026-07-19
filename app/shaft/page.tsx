import type { Metadata } from "next";
import { ShaftJourneyExperience } from "@/app/components/ShaftJourneyExperience";

export const metadata: Metadata = {
  title: "DEVDARIANI — Inside the Whole",
  description:
    "A journey through a coordinated MEP core that resolves directly into the DEVDARIANI projects index.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function ShaftJourneyPage() {
  return <ShaftJourneyExperience />;
}
