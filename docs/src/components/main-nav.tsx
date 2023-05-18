"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Icons } from "~/components/icons";
import { cn } from "~/lib/cn";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
}

export function MainNav(props: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 md:gap-10">
      {props.items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {props.items?.map(
            (item, index) =>
              item.href && (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "text-muted-foreground focus-visible:ring-ring ring-offset-background hover:bg-accent hover:text-accent-foreground flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    item.disabled && "cursor-not-allowed opacity-80",
                    pathname.includes(item.href) && "text-foreground"
                  )}
                >
                  {item.title}
                </Link>
              )
          )}
        </nav>
      ) : null}
    </div>
  );
}
