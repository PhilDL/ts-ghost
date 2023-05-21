import Link from "next/link";
import { siteConfig } from "~/app/site-config";
import { Icons } from "~/components/icons";
import { MainNav } from "~/components/main-nav";
import { MobileDropdown } from "~/components/mobile-nav";
import { ThemeToggle } from "~/components/theme-toggle";
import { buttonVariants } from "~/components/ui/button";

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link
          href="/"
          className="focus-visible:ring-ring ring-offset-background mr-3 flex h-9 items-center space-x-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:px-3"
        >
          <Icons.logo className="h-6 w-6" />
          <span className="text-sm font-bold md:text-lg">{siteConfig.name}</span>
        </Link>

        <MainNav items={siteConfig.docs} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({
                size: "sm",
                variant: "ghost",
              })}
            >
              <Icons.gitHub className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href={siteConfig.links.twitter} target="_blank" rel="noreferrer">
              <div
                className={buttonVariants({
                  size: "sm",
                  variant: "ghost",
                })}
              >
                <Icons.twitter className="h-5 w-5 fill-current" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link>
            <ThemeToggle />
            <MobileDropdown items={siteConfig.docs} />
          </nav>
        </div>
      </div>
    </header>
  );
}
