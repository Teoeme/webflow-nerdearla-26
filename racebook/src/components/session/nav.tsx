"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { joinClassNames } from "../ui/class-names";

type NavItem = {
  href: string;
  label: string;
  pendingCount: number;
};

const NAV_ITEM_CLASS_NAME =
  "text-label border-b-2 border-transparent pb-1 text-text-muted transition-colors hover:text-text aria-[current=page]:border-accent aria-[current=page]:text-text";

export function Nav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6">
      {items.map((item) => {
        const isCurrentPage = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrentPage ? "page" : undefined}
            className={joinClassNames(NAV_ITEM_CLASS_NAME, "flex items-center gap-2")}
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
