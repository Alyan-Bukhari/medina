"use client";

import { useCallback, useEffect } from "react";
import HorizontalFolio, { type StackItem } from "@/components/ui/horizontal-folio";

const projects: StackItem[] = [
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

export function RadialHero() {
  useEffect(() => {
    return () => document.body.classList.remove("is-radial-pinned");
  }, []);

  const onActiveChange = useCallback((active: boolean) => {
    document.body.classList.toggle("is-radial-pinned", active);
  }, []);

  return (
    <HorizontalFolio
      items={projects}
      eyebrow="Our Projects"
      body="Every development we have delivered in Lahore — plus Madina Mall & Residency, now live."
      onActiveChange={onActiveChange}
    />
  );
}
