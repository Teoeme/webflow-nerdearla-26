"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  pendingCount: number;
};

// Top bar on mobile (horizontal, underline for the active item), vertical
// list in the desktop sidebar (left bar for the active item, full width so
// the row's hover tint and the inbox count reach the edge).
const NAV_ITEM_CLASS_NAME =
  "flex items-center justify-between gap-2 border-b-2 border-transparent pb-1 text-sm font-semibold text-text-muted transition-colors hover:text-text aria-[current=page]:border-accent aria-[current=page]:text-text lg:w-full lg:rounded-sm lg:border-b-0 lg:border-l-2 lg:px-2.5 lg:py-2 lg:pb-2 lg:hover:bg-line/50";

export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 lg:w-full lg:flex-col lg:gap-1">
      {items.map((item) => {
        const isCurrentPage = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrentPage ? "page" : undefined}
            className={NAV_ITEM_CLASS_NAME}
          >
            <span>{item.label}</span>
            {item.pendingCount > 0 ? (
              <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-on-accent">
                {item.pendingCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
