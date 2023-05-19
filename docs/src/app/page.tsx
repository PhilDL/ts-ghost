import { Book, BookLock, Boxes, ChevronRightSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { siteConfig } from "~/app/site-config";
import { Icons } from "~/components/icons";
import { PackageCard } from "~/components/package-card";
import { buttonVariants } from "~/components/ui/button";

import heroLogo from "./hero-logo.png";

const IconMap = {
  "@ts-ghost/content-api": Book,
  "@ts-ghost/admin-api": BookLock,
  "@ts-ghost/ghost-blog-buster": ChevronRightSquare,
  "@ts-ghost/core-api": Boxes,
};
export default function IndexPage() {
  return (
    <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 overflow-hidden pb-8 pt-6 md:py-10">
      <div className="max-w-5xl space-y-8">
        <div className="flex items-center justify-center">
          <Image src={heroLogo} width={500} alt="ts-ghost logo" />
        </div>
        <h1
          className="font-cal animate-fade-up from-foreground/80 to-muted-foreground hidden bg-gradient-to-br bg-clip-text text-center text-5xl/[3rem] font-bold text-transparent opacity-0 drop-shadow-sm md:text-7xl/[5rem]"
          style={{ animationDelay: "0.20s", animationFillMode: "forwards" }}
        >
          <Balancer>{siteConfig.name}</Balancer>
        </h1>
        <p
          className="animate-fade-up text-muted-foreground/80 text-center opacity-0 md:text-xl"
          style={{ animationDelay: "0.30s", animationFillMode: "forwards" }}
        >
          <Balancer>
            <strong className="text-primary">
              @ts-ghost is a collection of tools written in TypeScript to interract with a your Ghost Blog!{" "}
            </strong>
            <br /> End-to-end type-safety 🦾, built on top of Zod, the Content and Admin API clients are
            type-safe and validated at runtime. There is also a beautiful CLI to interract with your Ghost
            Blog and extract data in Markdown or JSON.
          </Balancer>
        </p>
        <div className="grid grid-cols-2 gap-4">
          {siteConfig.docs.map((packageDoc, index) => (
            <PackageCard
              href={packageDoc.path}
              Icon={IconMap[packageDoc.package]}
              title={packageDoc.package}
              description={packageDoc.description}
              animationDelay={`0.${(index + 1) * 15 + 30}s`}
            />
          ))}
        </div>
        <div
          className="animate-fade-up flex justify-center gap-4 opacity-0"
          style={{ animationDelay: "0.40s", animationFillMode: "forwards" }}
        >
          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.github}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <Icons.gitHub className="mr-1 h-4 w-4" />
            GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}
