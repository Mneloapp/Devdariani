type ProjectIndexProps = {
  message: string;
};

export function ProjectIndex({ message }: ProjectIndexProps) {
  return (
    <div className="mt-12 max-w-md border-l border-[var(--line-strong)] pl-5 text-sm uppercase leading-7 tracking-[0.2em] text-[var(--text-muted)]">
      {message}
    </div>
  );
}
