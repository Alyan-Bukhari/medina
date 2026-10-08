"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Box } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";

type SeriesItem = {
  id: string;
  order: number;
  kind: "available" | "sold";
  title: string;
  meta: string;
  description: string;
  image: string;
  href: string;
  badge: string;
  badgeKind: "live" | "reserved" | "sold";
};

const ITEMS: SeriesItem[] = [
  {
    id: "upcoming",
    order: 7,
    kind: "available",
    title: "Madina Mall & Residency",
    meta: "36 months · Bahria Town",
    description:
      "Mixed-use mall and residences — studio to three-bed, premium retail, owned on a 36-month plan.",
    image: "/images/madina-mall-featured.jpg",
    href: "project.html?id=upcoming",
    badge: "Live",
    badgeKind: "live",
  },
  {
    id: "7",
    order: 6,
    kind: "sold",
    title: "Madina Silver Heights",
    meta: "Mixed Use · Bahria Town",
    description: "Twelve-month plan, 35 apartments — handed over 2025 in 166B Commercial.",
    image: "/images/project-7.jpg",
    href: "project.html?id=7",
    badge: "Sold Out",
    badgeKind: "sold",
  },
  {
    id: "6",
    order: 5,
    kind: "available",
    title: "Madina Heights 5",
    meta: "Commercial + Residential · Bahria Town",
    description: "Our largest Heights building — 84 apartments and 43 shops, still booking through 2026.",
    image: "/images/madina-heights-5/commercial-view.jpeg",
    href: "project.html?id=6",
    badge: "80% Sold",
    badgeKind: "reserved",
  },
  {
    id: "5",
    order: 4,
    kind: "available",
    title: "Madina Heights 4",
    meta: "Commercial + Residential · Safari Villas",
    description: "Two plots at Umer block — 54 apartments and 27 shops, still booking on a 30-month plan.",
    image: "/images/madina-heights-4/elevation/elevation-01.jpg",
    href: "project.html?id=5",
    badge: "80% Sold",
    badgeKind: "reserved",
  },
  {
    id: "4",
    order: 3,
    kind: "sold",
    title: "Madina Heights 3",
    meta: "Commercial + Residential · Safari Villas",
    description: "Umer block, next to Safari Villas — 22 apartments and two commercial halls, sold out.",
    image: "/images/project-4.jpg",
    href: "project.html?id=4",
    badge: "Sold Out",
    badgeKind: "sold",
  },
  {
    id: "3",
    order: 2,
    kind: "sold",
    title: "Madina Heights 2",
    meta: "Commercial + Apartments · Sector C",
    description: "Sector-C side commercial — 18 apartments and six halls, completed 2023.",
    image: "/images/madina-heights-2/photo-06.jpeg",
    href: "project.html?id=3",
    badge: "Sold Out",
    badgeKind: "sold",
  },
  {
    id: "2",
    order: 1,
    kind: "sold",
    title: "Madina Heights 1",
    meta: "Commercial + Apartments · Canal Bank Road",
    description: "Main Canal Bank Road — 22 apartments and two commercial halls, handed over in 2021.",
    image: "/images/project-2.jpg",
    href: "project.html?id=2",
    badge: "Sold Out",
    badgeKind: "sold",
  },
];

type FilterKind = "all" | "available" | "sold";

export function HeightsSeries() {
  const [filter, setFilter] = useState<FilterKind>("all");

  const visible = useMemo(
    () => ITEMS.filter((item) => filter === "all" || item.kind === filter),
    [filter]
  );

  const counts = useMemo(() => {
    return {
      all: ITEMS.length,
      available: ITEMS.filter((i) => i.kind === "available").length,
      sold: ITEMS.filter((i) => i.kind === "sold").length,
    };
  }, []);

  useEffect(() => {
    const htmlFilters = document.querySelector(".folio-page > .wrap > .folio-filters");
    if (htmlFilters instanceof HTMLElement) htmlFilters.style.display = "none";
  }, []);

  const filters: { id: FilterKind; label: string }[] = [
    { id: "all", label: "All" },
    { id: "available", label: "Available" },
    { id: "sold", label: "Sold Out" },
  ];

  return (
    <div className="heights-series">
      <section className="heights-page-hero relative w-full overflow-hidden bg-[#1c1512] text-[#fbf6ee]">
        <div className="heights-page-hero__media">
          <video
            className="heights-page-hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/madina-mall/videos/drone-poster.jpg"
            aria-hidden="true"
          >
            <source src="/images/madina-mall/videos/drone.mp4" type="video/mp4" />
          </video>
          <img
            className="heights-page-hero__poster"
            src="/images/madina-mall/videos/drone-poster.jpg"
            alt=""
            aria-hidden="true"
            decoding="async"
          />
        </div>

        <div className="heights-page-hero__veil" aria-hidden="true" />

        <div className="heights-page-hero__copy">
          <div className="max-w-xl">
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f2e6d6]/90">
              Madina Heights · Live now
            </p>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#af522a]/70 bg-[#af522a] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fbf6ee]">
              <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#fbf6ee]" />
              Live · Phase 07
            </p>
            <h1 className="font-serif text-[clamp(2.2rem,7vw,4.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.4)]">
              Madina Mall
              <span className="block">&amp; Residency</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#f2e6d6] sm:text-lg">
              The newest chapter in the Heights story — premium retail and residences in Bahria Town, on a 36-month plan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="project.html?id=upcoming"
                className="inline-flex items-center gap-2 rounded-full bg-[#af522a] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#fbf6ee] transition hover:bg-[#c45f32]"
              >
                Explore MMR
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
              </a>
              <a
                href="#heights-collection"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                View collection
              </a>
              <button
                type="button"
                data-3d-models
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <Box className="h-4 w-4" strokeWidth={2.4} />
                View 3D models
              </button>
            </div>
          </div>
        </div>

        <p className="heights-page-hero__scroll" aria-hidden="true">
          Scroll
        </p>
      </section>

      <div
        id="heights-collection"
        className="mx-auto w-full max-w-[68rem] scroll-mt-28 px-4 pb-8 pt-10 sm:px-6 sm:pt-12"
      >
        <header className="mb-8 text-center">
          <p className="eyebrow mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c6239]">
            Madina Heights — The collection
          </p>
          <h2 className="font-serif text-[clamp(1.8rem,4vw,2.8rem)] font-medium uppercase leading-[1.05] tracking-[-0.03em] text-[#1c1512]">
            Every Madina Heights development in one <em className="italic font-normal">place.</em>
          </h2>
        </header>

        <div
          className="mb-8 flex flex-wrap items-center justify-center gap-2"
          role="group"
          aria-label="Filter projects"
        >
          {filters.map((f) => {
            const active = filter === f.id;
            const count = counts[f.id];
            if (f.id !== "all" && count === 0) return null;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={
                  "rounded-full border px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition " +
                  (active
                    ? "border-[#452d2a] bg-[#452d2a] text-[#f2e6d6]"
                    : "border-[#8c6239]/45 bg-transparent text-[#452d2a] hover:border-[#452d2a]")
                }
              >
                {f.label}
                <span className={"ml-1.5 " + (active ? "text-[#d4c4b0]" : "text-[#af522a]")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-5">
          {visible.map((item) => (
            <GlassCard
              key={item.id}
              title={item.title}
              meta={item.meta}
              description={item.description}
              image={item.image}
              href={item.href}
              badge={item.badge}
              badgeKind={item.badgeKind}
              order={item.order}
            />
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-8 text-center text-[#6e5c55]">
            Nothing in this chapter. Try another filter.
          </p>
        ) : null}
      </div>
    </div>
  );
}
