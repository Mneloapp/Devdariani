import {
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
        ]}
      />
      <FragmentationSection />
      <OrchestricsReveal />
      <MethodologySection />
      <FrameworkSection />
      <CompanyIntro />
      <SystemsSection />
      <MneloSection />
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}
