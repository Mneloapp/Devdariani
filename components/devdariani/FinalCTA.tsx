import { SectionMotion } from "./SectionMotion";

export function FinalCTA() {
  return (
    <SectionMotion
      id="contact"
      className="section-shell flex min-h-[78vh] items-center justify-center py-28 text-center"
    >
      <div className="max-w-5xl">
        <p className="eyebrow mb-8">Final Invitation</p>
        <h2 className="text-balance text-[clamp(2.9rem,7vw,7.6rem)] font-light leading-[0.96]">
          If your project demands coordination instead of compromise, start the
          conversation.
        </h2>
        <a href="mailto:hello@devdariani.com" className="premium-button mt-12">
          Start the Conversation
        </a>
      </div>
    </SectionMotion>
  );
}
