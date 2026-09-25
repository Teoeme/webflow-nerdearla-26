import type { ComponentProps, ReactNode } from "react";
import { joinClassNames } from "./class-names";

const controlClassName =
  "bg-field border border-line rounded-sm text-text px-3 py-2 focus:border-accent focus:outline-none";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-label text-text-muted">
        {label}
      </label>
      {children}
      {hint ? <span className="text-sm text-text-muted">{hint}</span> : null}
    </div>
  );
}

export function Input({ className, type, ...rest }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={joinClassNames(controlClassName, type === "number" && "text-metric", className)}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <select className={joinClassNames(controlClassName, className)} {...rest}>
      {children}
    </select>
  );
}
