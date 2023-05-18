import {
  ArrowRight,
  ArrowUpRight,
  Book,
  BookLock,
  Boxes,
  ChevronRightSquare,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { siteConfig } from "~/app/site-config";
import { Icons } from "~/components/icons";
import { buttonVariants } from "~/components/ui/button";

import heroLogo from "./hero-logo.png";

export const PackageCard = ({
  href,
  Icon,
  title,
  description,
  animationDelay = "0.20s",
}: {
  href: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  animationDelay: string;
}) => {
  return (
    <Link
      href={href}
      className="animate-fade-up border-muted hover:bg-muted min-h-32 group relative flex justify-between gap-4 rounded-md border p-6 opacity-0"
      style={{ animationDelay: animationDelay, animationFillMode: "forwards" }}
    >
      <Icon className="text-muted-foreground absolute bottom-auto right-2 top-auto h-24 w-24 opacity-10" />
      <div className="flex flex-1 flex-col items-start gap-2">
        <h3 className="font-mono text-lg font-bold">{title}</h3>
        <p className="text-muted-foreground max-w-[80%]">{description}</p>
        {/* <Link href={href} className={buttonVariants({ variant: "outline", size: "lg" })}>
          <ArrowRight className="mr-1 h-4 w-4" />
          Docs
        </Link> */}
      </div>

      {/* <ArrowUpRight className="absolute right-2 top-2 h-6 w-6 text-muted-foreground"/> */}
    </Link>
  );
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
          <PackageCard
            href="/docs/content-api/introduction"
            Icon={Book}
            title="@ts-ghost/content-api"
            description="A TypeScript Content API Client for Ghost with end-to-end TypeSafety, using fetch compatible with NextJS and Remix."
            animationDelay="0.20s"
          />
          <PackageCard
            href="/docs/admin-api/introduction"
            Icon={BookLock}
            title="@ts-ghost/admin-api"
            description="A TypeScript Admin API Client for Ghost with end-to-end TypeSafety for GET PUT and POST, using fetch compatible with NextJS and Remix."
            animationDelay="0.30s"
          />
          <PackageCard
            href="/docs/ghost-blog-buster/introduction"
            Icon={ChevronRightSquare}
            title="@ts-ghost/ghost-blog-buster"
            description="A beautiful interractive CLI to connect to your Ghost Blog and export Posts to markdown, Members to JSON, etc..."
            animationDelay="0.40s"
          />
          <PackageCard
            href="/docs/core-api/introduction"
            Icon={Boxes}
            title="@ts-ghost/core-api"
            description="The base building blocks for the Content and Admin API. Used internally."
            animationDelay="0.50s"
          />
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
