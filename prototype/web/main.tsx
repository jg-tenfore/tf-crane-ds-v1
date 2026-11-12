import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CraneWebPresenter } from "@/prototype-app/web-presenter";
import "@/styles/globals.css";

// Review tool: side panel + WebFrame at a chosen width; "Full window" (default on phones) is the bare app.
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <CraneWebPresenter />
    </StrictMode>,
);
