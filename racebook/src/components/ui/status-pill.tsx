import type { TransferStatus } from "@/db/types";
import { joinClassNames } from "./class-names";

const statusClassName: Record<TransferStatus, string> = {
  pending: "border-accent text-accent",
  accepted: "border-line text-text",
  rejected: "border-line text-text-muted",
};

export function StatusPill({ status, label }: { status: TransferStatus; label: string }) {
  return (
    <span className={joinClassNames("rounded-sm border px-2 text-label", statusClassName[status])}>
      {label}
    </span>
  );
}
