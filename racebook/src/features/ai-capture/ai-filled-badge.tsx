// A small badge next to a form field's label, marking it as auto-filled from a
// screenshot capture. `label` is the full sentence ("Filled by AI" / "Completado
// con IA"), used as the accessible name; the badge itself only shows "AI" so it
// stays unobtrusive next to the label text.
export function AiFilledBadge({ label }: { label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="inline-flex items-center rounded-sm border border-accent/40 bg-accent/15 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-accent"
    >
      AI
    </span>
  );
}
