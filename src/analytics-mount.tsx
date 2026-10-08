import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";

const host = document.createElement("div");
host.id = "vercel-analytics-root";
host.hidden = true;
document.body.appendChild(host);

createRoot(host).render(<Analytics />);
