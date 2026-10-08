import { createRoot } from "react-dom/client";
import { RelatedGlass } from "@/components/related-glass";
import "./heights.css";

function currentProjectId() {
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("id") ||
    document.body?.getAttribute("data-seo-project") ||
    ""
  );
}

function mount() {
  const el = document.getElementById("related-glass-root");
  if (!el || !window.RT?.PROJECTS?.length) return;

  const id = currentProjectId();
  if (!id) return;

  el.hidden = false;
  const grid = document.getElementById("p-related-grid");
  if (grid) {
    grid.hidden = true;
    grid.innerHTML = "";
  }

  createRoot(el).render(<RelatedGlass currentId={id} />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // After project-page boot fills branding / related
    requestAnimationFrame(mount);
  });
} else {
  requestAnimationFrame(mount);
}
