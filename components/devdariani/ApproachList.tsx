import { EditorialSection } from "./EditorialSection";

const approach = [
  ["Understand", "Define the real conditions."],
  ["Map", "Locate dependencies early."],
  ["Coordinate", "Align systems before conflict."],
  ["Deliver", "Move with precision."],
  ["Validate", "Confirm the whole."],
];

export function ApproachList() {
  return (
    <div className="bg-dark text-ivory">
      <EditorialSection className="section-shell flex min-h-screen items-center py-24 md:py-40">
        <div className="w-full">
          <p className="mb-14 text-sm uppercase tracking-[0.24em] text-ivory/54">
            Approach
          </p>
          <div className="grid gap-10 md:grid-cols-5">
            {approach.map(([title, copy]) => (
              <div key={title} className="border-t border-ivory/18 pt-6">
                <h3 className="text-2xl font-light">{title}</h3>
                <p className="mt-6 text-sm leading-relaxed text-ivory/58">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </EditorialSection>
    </div>
  );
}
