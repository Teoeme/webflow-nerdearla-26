import type { Medal } from "@/db/types";
import { joinClassNames } from "./class-names";

const medalClassName: Record<Medal, string> = {
  gold: "bg-medal-gold",
  silver: "bg-medal-silver",
  bronze: "bg-medal-bronze",
};

export function MedalBadge({ medal, label }: { medal: Medal; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className={joinClassNames("h-3 w-3 rounded-full", medalClassName[medal])} />
      <span className="text-label">{label}</span>
    </span>
  );
}
