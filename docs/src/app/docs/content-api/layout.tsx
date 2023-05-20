import { Metadata } from "next";
import { ReactNode } from "react";
import { siteConfig } from "~/app/site-config";
import { DocsSidebarNav } from "~/components/sidebar";
import { ScrollArea } from "~/components/ui/scroll-area";

export const metadata: Metadata = {
  title: {
    default: "TS Ghost Content API",
    template: `%s - TS Ghost Content API`,
  },
  description:
    "Documentation for @ts-ghost/content-api a fully typed, runtime validated, and ergonomic TypeScript client for the Content API of Ghost.",
};

export default function PackageDocsLayout(props: { children: ReactNode }) {
  const navigation = siteConfig.docs.find((item) => item.path === "/docs/content-api")?.navigation;
  if (!navigation) throw new Error("No navigation found for /docs/content-api");
  return (
    <>
      <aside className="fixed top-14 z-30 -ml-2 -mr-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
        <ScrollArea className="py-6 pr-4 lg:py-8">
          <DocsSidebarNav navigation={navigation} />
        </ScrollArea>
      </aside>
      <main className="max-w-3xl pb-16">{props.children}</main>
    </>
  );
}
