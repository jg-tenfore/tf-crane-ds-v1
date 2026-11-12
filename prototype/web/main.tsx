import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CraneWebPrototype } from "@/prototype-app/web-prototype";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <CraneWebPrototype />
    </StrictMode>,
);
