import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlassCardProps = React.HTMLAttributes<HTMLAnchorElement> & {
  title: string;
  meta: string;
  description: string;
  image: string;
  href: string;
  badge: string;
  badgeKind?: "live" | "reserved" | "sold";
  order?: number;
};

const badgeStyles: Record<NonNullable<GlassCardProps["badgeKind"]>, string> = {
  live: "bg-[#af522a] text-[#fbf6ee] border-[#af522a]/80",
  reserved: "bg-[#af522a] text-[#fbf6ee] border-[#af522a]/80",
  sold: "bg-[#452d2a] text-[#fbf6ee] border-white/15",
};

const GlassCard = React.forwardRef<HTMLAnchorElement, GlassCardProps>(
  (
    {
      className,
      title,
      meta,
      description,
      image,
      href,
      badge,
      badgeKind = "sold",
      order,
      ...props
    },
    ref
  ) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          "group relative block aspect-[29/38] w-[min(18.125rem,calc(100vw-2.5rem))] shrink-0 [perspective:1000px] sm:w-[290px]",
          className
        )}
        {...props}
      >
        <div className="relative h-full overflow-hidden rounded-[40px] bg-gradient-to-br from-[#2a1c19] to-[#120c0b] shadow-2xl transition-all duration-500 ease-in-out [transform-style:preserve-3d] group-hover:[box-shadow:rgba(28,21,18,0.35)_30px_50px_25px_-40px,rgba(28,21,18,0.18)_0px_25px_30px_0px] group-hover:[transform:rotate3d(1,1,0,18deg)]">
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          {/* Bottom shade only — keep the photo sharp */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#120c0b]/92 via-[#120c0b]/25 to-transparent" />
          <div className="pointer-events-none absolute inset-2 rounded-[34px] border border-white/15 [transform:translate3d(0,0,22px)]" />

          <div className="absolute left-5 top-5 z-10 [transform:translate3d(0,0,28px)]">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]",
                badgeStyles[badgeKind]
              )}
            >
              {badgeKind === "live" ? (
                <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#fbf6ee]" />
              ) : null}
              {badge}
            </span>
          </div>

          {typeof order === "number" ? (
            <div className="absolute right-5 top-5 z-10 grid h-11 w-11 place-content-center rounded-full bg-white/95 text-[#1c1512] shadow-[rgba(100,100,111,0.25)_-8px_10px_18px_0px] transition-all duration-500 [transform:translate3d(0,0,40px)] group-hover:[transform:translate3d(0,0,56px)]">
              <span className="font-mono text-xs font-semibold tracking-wider">
                {String(order).padStart(2, "0")}
              </span>
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 z-10 p-6 [transform:translate3d(0,0,30px)]">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d4c4b0]">
              {meta}
            </p>
            <h3 className="font-serif text-[1.35rem] font-medium uppercase leading-[1.1] tracking-[-0.02em] text-[#fbf6ee]">
              {title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-300">
              {description}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                See project
              </span>
              <span className="grid h-8 w-8 place-content-center rounded-full bg-white text-[#1c1512] shadow-[rgba(0,0,0,0.35)_0px_8px_12px_-6px] transition-all duration-300 group-hover:bg-[#af522a] group-hover:text-white group-hover:[transform:translate3d(0,0,18px)]">
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
              </span>
            </div>
          </div>

        </div>
      </a>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
