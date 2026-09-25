import { joinClassNames } from "./class-names";

const BRAND_NAME = "RACEBOOK";

export type WordmarkTone = "default" | "accent";

const wordmarkToneClassName: Record<WordmarkTone, string> = {
  default: "text-text",
  accent: "text-accent",
};

export function Wordmark({
  tone = "default",
  className,
}: {
  tone?: WordmarkTone;
  className?: string;
}) {
  return (
    <span className={joinClassNames("text-display", wordmarkToneClassName[tone], className)}>
      {BRAND_NAME}
    </span>
  );
}
