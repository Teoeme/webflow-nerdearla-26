"use client";

import type { ComponentProps, ReactNode } from "react";
import { Select as RadixSelect } from "radix-ui";
import { joinClassNames } from "./class-names";

const controlClassName =
  "bg-field border border-line rounded-sm text-text px-3 py-2 focus:border-accent focus:outline-none";

const surfaceTransitionClassName =
  "motion-safe:data-[state=open]:animate-[surface-in_150ms_ease-out] motion-safe:data-[state=closed]:animate-[surface-out_150ms_ease-in]";

const selectContentClassName = joinClassNames(
  "panel z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden p-1 text-text",
  surfaceTransitionClassName,
);

const selectItemClassName =
  "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent/10 data-[highlighted]:text-accent";

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

export type SelectOption = { value: string; label: string };

export function Select({
  name,
  options,
  defaultValue,
  placeholder,
  onValueChange,
  id,
  "aria-label": ariaLabel,
  required,
  disabled,
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  "aria-label"?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <RadixSelect.Root
      name={name}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      required={required}
      disabled={disabled}
    >
      <RadixSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        className={joinClassNames(
          controlClassName,
          "flex w-full items-center justify-between gap-2 data-[placeholder]:text-text-muted disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="text-text-muted">▾</RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className={selectContentClassName} position="popper" sideOffset={4}>
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className={selectItemClassName}>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>✓</RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
