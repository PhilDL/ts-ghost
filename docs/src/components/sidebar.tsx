"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, NavSection } from "~/app/site-config";
import { cn } from "~/lib/cn";

export const DocsSidebarNav = ({ navigation }: { navigation: NavSection[] }) => {
  const pathname = usePathname();

  return navigation.length ? (
    <div className="w-full px-2">
      {navigation.map((section, index) => (
        <div key={index} className={cn("pb-6")}>
          <h4 className="mb-1 rounded-md px-3 py-1 text-sm font-semibold">{section.title}</h4>
          {section?.items?.length && <DocsSidebarNavItems items={section.items} pathname={pathname} />}
        </div>
      ))}
    </div>
  ) : null;
};

export function DocsSidebarNavItems(props: { items: NavItem[]; pathname: string | null }) {
  return props.items?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {props.items.map((item, index) =>
        item.href ? (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "focus-visible:ring-ringfocus-visible:outline-none focus-visible:ring-ring ring-offset-background group flex h-9 w-full items-center rounded-md border border-transparent px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              item.disabled && "cursor-not-allowed opacity-60",
              {
                "bg-accent border-border text-accent-foreground font-medium": props.pathname === item.href,
              }
            )}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            {item.title}
            {item.label && (
              <span className="ml-2 rounded-md bg-teal-100 px-1.5 py-0.5 text-xs no-underline group-hover:no-underline dark:bg-teal-600">
                {item.label}
              </span>
            )}
          </Link>
        ) : (
          <span
            key={index}
            className="text-muted-foreground flex w-full cursor-not-allowed items-center rounded-md p-2 hover:underline"
          >
            {item.title}
          </span>
        )
      )}
    </div>
  ) : null;
}
