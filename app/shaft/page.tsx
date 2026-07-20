import type { Metadata } from "next";
import { ShaftJourneyExperience } from "@/app/components/ShaftJourneyExperience";

export const metadata: Metadata = {
  title: "DEVDARIANI — Inside the Whole",
  description:
    "A journey through a coordinated MEP core, the engineering corridor behind Orchestrics, and the city beyond DEVDARIANI.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function ShaftJourneyPage() {
  return <ShaftJourneyExperience />;
}
