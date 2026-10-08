"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export type StackItem = {
  src: string;
  title: string;
  caption?: string;
  href: string;
};

const DEFAULT_ITEMS: StackItem[] = [
  { src: "/images/la-monte-vista/exterior-card.jpeg", title: "La Monte Vista", caption: "Sold Out", href: "project.html?id=1" },
  { src: "/images/project-2.jpg", title: "Madina Heights 1", caption: "Sold Out", href: "project.html?id=2" },
  { src: "/images/madina-heights-2/photo-06.jpeg", title: "Madina Heights 2", caption: "Sold Out", href: "project.html?id=3" },
  { src: "/images/project-4.jpg", title: "Madina Heights 3", caption: "Sold Out", href: "project.html?id=4" },
  { src: "/images/madina-heights-4/elevation/elevation-01.jpg", title: "Madina Heights 4", caption: "80% Sold", href: "project.html?id=5" },
  { src: "/images/madina-heights-5/commercial-view.jpeg", title: "Madina Heights 5", caption: "80% Sold", href: "project.html?id=6" },
  { src: "/images/project-7.jpg", title: "Madina Silver Heights", caption: "Sold Out", href: "project.html?id=7" },
  { src: "/images/madina-homes/page-1.jpg", title: "Madina Homes", caption: "Sold Out", href: "project.html?id=8" },
  {
    src: "/images/madina-mall-featured.jpg",
    title: "Madina Mall & Residency",
    caption: "Live",
    href: "project.html?id=upcoming",
  },
];

type CssImageStackingProps = {
  items?: StackItem[];
  eyebrow?: string;
  body?: string;
  onActiveChange?: (active: boolean) => void;
};

export default function CssImageStacking({
  items = DEFAULT_ITEMS,
  eyebrow = "Our Projects",
  body = "Every development we have delivered in Lahore — plus Madina Mall & Residency, now live.",
  onActiveChange,
}: CssImageStackingProps) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !onActiveChange) return;
    const io = new IntersectionObserver(
      ([entry]) => onActiveChange(entry.isIntersecting),
      { rootMargin: "-12% 0px -18% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onActiveChange]);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const heading = (
    <>
      The full{" "}
      <em
        className="font-medium"
        style={{
          fontFamily: "Fraunces, Iowan Old Style, Palatino, serif",
          fontStyle: "italic",
          fontWeight: 300,
          textTransform: "none",
        }}
      >
        collection.
      </em>
    </>
  );

  if (reduce) {
    return (
      <section ref={rootRef} className="bg-background px-[var(--gutter,1.5rem)] py-20 text-foreground">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c6239]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-center font-serif text-[clamp(2rem,5vw,3.5rem)] font-light uppercase tracking-tight">
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground">{body}</p>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a key={item.href} href={item.href} className="overflow-hidden rounded-md bg-[#372522]">
              <img src={item.src} alt={item.title} className="aspect-3/4 w-full object-cover" />
              <span className="block px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#fcf0e0]">
                {item.title}
              </span>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={rootRef} className="bg-background text-foreground">
      <div className="wrapper">
        <section className="sticky top-0 grid h-screen w-full place-content-center bg-background">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#452d2a14_1px,transparent_1px),linear-gradient(to_bottom,#452d2a14_1px,transparent_1px)] bg-size-[54px_54px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <p className="relative z-10 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8c6239]">
            {eyebrow}
          </p>
          <h2 className="relative z-10 mt-4 max-w-5xl px-8 text-center font-serif text-5xl font-light uppercase leading-[0.95] tracking-tight 2xl:text-7xl">
            {heading}
          </h2>
          <p className="relative z-10 mt-5 max-w-lg px-8 text-center text-sm tracking-wide text-muted-foreground">
            {body}
          </p>
        </section>
      </div>

      <section className="w-full bg-background">
        {items.map((item, i) => {
          const width = Math.min(55 + i * 3.5, 86);
          return (
            <div
              key={item.href}
              className="sticky w-full"
              style={{ top: i * 8, zIndex: i + 1 }}
            >
              <figure className="flex h-screen w-full items-center justify-center">
                <a
                  href={item.href}
                  aria-label={`${item.title}${item.caption ? ` — ${item.caption}` : ""}`}
                  className="rt-stack-frame relative block overflow-hidden rounded-md bg-[#372522] transition-all duration-300"
                  style={
                    {
                      "--stack-w": `${width}%`,
                      boxShadow:
                        i === 0
                          ? "none"
                          : "0 -5px 16px 4px rgba(0,0,0,0.55), 0 2px 4px -1px rgba(0,0,0,0.06)",
                    } as CSSProperties
                  }
                >
                  <img
                    src={item.src}
                    alt={`${item.title}${item.caption ? `, ${item.caption}` : ""}`}
                    className="h-full w-full object-cover object-center align-bottom"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-[#1c1211]/90 via-[#1c1211]/45 to-transparent px-5 pb-4 pt-16 text-[#fcf0e0]">
                    <span
                      className="text-xs font-medium uppercase tracking-[0.12em] sm:text-sm"
                      style={{ fontFamily: "General Sans, ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {item.title}
                    </span>
                    {item.caption ? (
                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#d1bca1]">
                        {item.caption}
                      </span>
                    ) : null}
                  </span>
                </a>
              </figure>
            </div>
          );
        })}
      </section>
    </section>
  );
}
