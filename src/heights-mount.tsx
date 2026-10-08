import { createRoot } from "react-dom/client";
import { HeightsSeries } from "@/components/heights-series";
import "./heights.css";

function isHeightsSeries() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("series") === "madina-heights") return true;
  return document.body?.getAttribute("data-seo-series") === "madina-heights";
}

const el = document.getElementById("heights-series-root");
if (el && isHeightsSeries()) {
  document.body.classList.add("is-folio-series", "is-series-madina-heights");
  el.hidden = false;
  const grid = document.querySelector(".folio-grid");
  if (grid) grid.classList.add("is-hidden");

  createRoot(el).render(<HeightsSeries />);

  const header = document.querySelector(".site-header");
  if (header) {
    header.classList.remove("is-light");
    header.classList.remove("is-scrolled");
  }
}
