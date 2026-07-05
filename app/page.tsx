import {
  CaseStudyPreview,
  CompanyIntro,
  FinalCTA,
  FloatingNav,
  FrameworkSection,
  FragmentationSection,
  HeroSilence,
  ManifestoSection,
  MethodologySection,
  MneloSection,
  OrchestricsReveal,
  SiteFooter,
  SystemsSection,
} from "@/components/devdariani";

export default function Home() {
  return (
    <main>
      <FloatingNav />
      <HeroSilence />
      <ManifestoSection
        id="world"
        eyebrow="The World Has Changed"
        lines={[
          "Modern buildings are no longer built.",
          "They are orchestrated.",
          "Yet most projects are still managed as isolated disciplines.",
        ]}
      />
      <FragmentationSection />
      <OrchestricsReveal />
      <MethodologySection />
      <ManifestoSection
        eyebrow="The Art of Orchestrics"
        align="center"
        lines={[
          "Engineering is no longer about isolated systems.",
          "It is about how systems become one.",
          "The Art of Orchestrics™ is the discipline of designing, integrating and delivering buildings as coordinated wholes.",
        ]}
      />
      <CompanyIntro />
      <SystemsSection />
      <FrameworkSection />
      <CaseStudyPreview />
      <MneloSection />
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
