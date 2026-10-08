"use client";

import GlassCard from "@/components/ui/glass-card";

type RTProject = {
  id: string;
  name: string;
  status: string;
  filter: string;
  type?: string;
  location?: string;
  overview?: string;
  image: string;
};

declare global {
  interface Window {
    RT?: {
      PROJECTS?: RTProject[];
      projectHref?: (id: string) => string;
    };
  }
}

function badgeKind(p: RTProject): "live" | "reserved" | "sold" {
  if (/live/i.test(p.status) || p.filter === "upcoming") return "live";
  if (p.filter === "available" || /%|reserv/i.test(p.status)) return "reserved";
  return "sold";
}

function badgeLabel(p: RTProject) {
  if (/live/i.test(p.status) || p.filter === "upcoming") return "Live";
  if (/80%|sold/i.test(p.status) && p.filter === "available") return "80% Sold";
  if (p.filter === "sold" || /sold/i.test(p.status)) return "Sold Out";
  return p.status;
}

export function RelatedGlass({ currentId }: { currentId: string }) {
  const projects = (window.RT?.PROJECTS || [])
    .filter((p) => String(p.id) !== String(currentId))
    .sort((a, b) => {
      const rank = (p: RTProject) =>
        p.filter === "upcoming" ? 0 : p.filter === "available" ? 1 : 2;
      return rank(a) - rank(b);
    })
    .slice(0, 4);

  if (!projects.length) return null;

  return (
    <div className="related-glass mx-auto flex w-full max-w-[68rem] flex-wrap items-stretch justify-center gap-x-4 gap-y-5">
      {projects.map((p, i) => {
        const href = window.RT?.projectHref
          ? window.RT.projectHref(p.id)
          : "project.html?id=" + encodeURIComponent(p.id);
        const meta = [p.type, p.location].filter(Boolean).join(" · ");
        const description = ((p.overview || "").split(". ")[0] || "") + ".";
        return (
          <GlassCard
            key={p.id}
            title={p.name}
            meta={meta}
            description={description}
            image={p.image.startsWith("/") ? p.image : "/" + p.image}
            href={href}
            badge={badgeLabel(p)}
            badgeKind={badgeKind(p)}
            order={projects.length - i}
          />
        );
      })}
    </div>
  );
}
