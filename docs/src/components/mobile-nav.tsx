"use client";

import { PopoverClose } from "@radix-ui/react-popover";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import type { PackageDocumentationConfig } from "~/app/site-config";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/cn";

import { Icons } from "./icons";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

export const MobileDropdown = ({ items }: { items: PackageDocumentationConfig[] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const currentPackage = items.find((item) => pathname.startsWith(item.path))!;

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="hamburger mr-2 space-x-2 px-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Icons.menu className={cn("h-6 w-6", isOpen && "open")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-background z-40 mt-2 h-[calc(100vh-4rem)] w-screen animate-none rounded-none border-none transition-transform md:hidden">
        <div className="border-b pb-4">
          <div className="grid grid-cols-2 gap-2">
            {/* item.package === currentPackage.package */}
            {items.map((item) => (
              <Link
                href={item.path}
                key={item.package}
                className={buttonVariants({
                  variant: currentPackage && item.package === currentPackage.package ? "default" : "outline",
                })}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        {currentPackage && (
          <ScrollArea className="h-[75%] w-full pb-8">
            {currentPackage.navigation.map((section, index) => (
              <div key={index} className="flex flex-col space-y-3 pt-6">
                <h4 className="font-bold">{section.title}</h4>
                {section.items.length &&
                  section.items.map((item) => (
                    <PopoverClose asChild key={item.href}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={cn(
                            "text-muted-foreground hover:text-primary flex py-1 text-base font-medium transition-colors",
                            item.href === pathname && "text-foreground"
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
                        item.title
                      )}
                    </PopoverClose>
                  ))}
              </div>
            ))}
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};
