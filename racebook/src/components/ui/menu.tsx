"use client";

import type { ReactNode } from "react";
import { DropdownMenu as RadixMenu } from "radix-ui";

export type MenuItem = { label: string; onSelect: () => void };

export function Menu({
  trigger,
  items,
  align = "start",
}: {
  trigger: ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
}) {
  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger asChild>{trigger}</RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          align={align}
          sideOffset={4}
          className="panel z-50 min-w-40 overflow-hidden p-1 text-text motion-safe:data-[state=open]:animate-[surface-in_150ms_ease-out] motion-safe:data-[state=closed]:animate-[surface-out_150ms_ease-in]"
        >
          {items.map((item) => (
            <RadixMenu.Item
              key={item.label}
              onSelect={item.onSelect}
              className="cursor-pointer rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent/10 data-[highlighted]:text-accent"
            >
              {item.label}
            </RadixMenu.Item>
          ))}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  );
}
