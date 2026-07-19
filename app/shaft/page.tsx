import type { Metadata } from "next";
import { ShaftJourneyExperience } from "@/app/components/ShaftJourneyExperience";

export const metadata: Metadata = {
  title: "DEVDARIANI — Inside the Whole",
  description:
    "A journey through the coordinated MEP core of a completed central-city building.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function ShaftJourneyPage() {
  return <ShaftJourneyExperience />;
}
