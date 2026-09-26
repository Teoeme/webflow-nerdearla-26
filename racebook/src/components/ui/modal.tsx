"use client";

import type { ReactNode } from "react";
import { Dialog as RadixDialog } from "radix-ui";

export type ModalSize = "default" | "wide";

const modalWidthClassName: Record<ModalSize, string> = {
  default: "max-w-lg",
  wide: "max-w-2xl",
};

export function Modal({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  closeLabel,
  size = "default",
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeLabel: string; // translated by the caller
  size?: ModalSize;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-background/80 motion-safe:data-[state=open]:animate-[overlay-in_150ms_ease-out] motion-safe:data-[state=closed]:animate-[overlay-out_150ms_ease-in]" />
        <RadixDialog.Content className={`panel fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] ${modalWidthClassName[size]} -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] overflow-y-auto p-4 sm:p-6 motion-safe:data-[state=open]:animate-[surface-in_150ms_ease-out] motion-safe:data-[state=closed]:animate-[surface-out_150ms_ease-in]`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <RadixDialog.Title className="text-heading text-lg">{title}</RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="text-text-muted">{description}</RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close
              aria-label={closeLabel}
              className="text-text-muted transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              ✕
            </RadixDialog.Close>
          </div>
          <div className="mt-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
