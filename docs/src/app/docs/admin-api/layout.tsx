import { DocsSidebarNav } from "~/components/sidebar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { navigation } from "./navigation";
import { ReactNode } from "react";

export default function PackageDocsLayout(props: { children: ReactNode }) {
  return (
    <>
      <aside className="fixed top-14 z-30 -ml-2 -mr-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
        <ScrollArea className="py-6 pr-4 lg:py-8">
          <DocsSidebarNav items={navigation} />
        </ScrollArea>
      </aside>
      <main className="pb-16 max-w-3xl">{props.children}</main>
    </>
  );
}
