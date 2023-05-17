import { ReactNode } from "react";

export default function DocsLayout(props: { children: ReactNode }) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-10">
      {props.children}
    </div>
  );
}
