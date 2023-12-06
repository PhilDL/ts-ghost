"use client";

import { cn } from "~/lib/cn";
import { CheckCheck, Copy } from "lucide-react";
import { useRef, useState } from "react";

import { Icons } from "../icons";

export type CodeblockProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLPreElement>,
  HTMLPreElement
> & {
  /** set by `rehype-pretty-code` */
  "data-language"?: string;
  /** set by `rehype-pretty-code` */
  "data-theme"?: string;
};

export function Codeblock(props: CodeblockProps) {
  const { children, ...rest } = props;
  const language = props["data-language"] as string;
  const theme = props["data-theme"] as string;
  const Icon = {
    js: Icons.javascript,
    ts: Icons.typescript,
    tsx: Icons.typescript,
    prisma: Icons.prisma,
    bash: Icons.bash,
  }[language];

  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  return (
    <>
      {Icon && (
        <Icon
          data-language-icon
          data-theme={theme}
          className="text-foreground absolute left-4 top-4 z-20 h-5 w-5"
        />
      )}
      <button
        aria-label="Copy to Clipboard"
        data-theme={theme}
        onClick={() => {
          if (typeof window === "undefined" || !ref.current) return;
          setCopied(true);
          void window.navigator.clipboard.writeText(ref.current.innerText);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-muted-foreground hover:bg-muted absolute right-2 top-[10px] z-20 h-8 w-8 cursor-pointer rounded"
      >
        <div className="relative h-full w-full p-1">
          <Copy className={cn("absolute h-6 w-6 p-0 transition-all", copied && "scale-0")} />
          <CheckCheck className={cn("absolute h-6 w-6 scale-0 p-0 transition-all", copied && "scale-100")} />
        </div>
      </button>
      <pre
        ref={ref}
        {...rest}
        className={cn(
          rest.className,
          "bg-muted text-muted-foreground relative my-4 overflow-x-auto rounded-lg border p-4 font-mono text-sm font-semibold",
        )}
      >
        {children}
      </pre>
    </>
  );
}
