import { createRoot } from "react-dom/client";
import { RadialHero } from "@/components/radial-hero";
import "./radial.css";

const el = document.getElementById("radial-root");
if (el) {
  createRoot(el).render(<RadialHero />);
}
