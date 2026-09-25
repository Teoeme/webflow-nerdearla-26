import { joinClassNames } from "./class-names";

export function Stat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label text-text-muted">{label}</span>
      <span
        className={joinClassNames(
          "text-heading text-2xl text-metric",
          emphasis ? "text-accent" : "text-text",
        )}
      >
        {value}
      </span>
    </div>
  );
}
