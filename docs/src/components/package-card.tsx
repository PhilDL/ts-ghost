import type { LucideIcon } from "lucide-react";
import Link from "next/link";

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
