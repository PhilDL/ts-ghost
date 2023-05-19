import { ReactNode } from "react";
import { siteConfig } from "~/app/site-config";
import { DocsSidebarNav } from "~/components/sidebar";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function PackageDocsLayout(props: { children: ReactNode }) {
  const navigation = siteConfig.docs.find((item) => item.path === "/docs/admin-api")?.navigation;
  if (!navigation) throw new Error("No navigation found for /docs/admin-api");
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
