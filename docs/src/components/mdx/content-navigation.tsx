import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "~/components/ui/button";

export interface ContentNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  next?: {
    title: string;
    href: string;
  };
  previous?: {
    title: string;
    href: string;
  };
}

export const ContentNavigation = ({ children, next, previous, ...props }: ContentNavigationProps) => {
  return (
    <div className="border-input mt-12 flex w-full items-center justify-between border-t pt-4" {...props}>
      <div className="flex flex-1 justify-start">
        {previous && (
          <Link href={previous.href} className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {previous.title}
          </Link>
        )}
      </div>
      <div className="flex flex-1 justify-end">
        {next && (
          <div className="flex flex-col">
            <Link href={next.href} className={buttonVariants({ variant: "outline" })}>
              {next.title} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};
