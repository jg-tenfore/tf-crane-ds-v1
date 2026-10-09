import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Presenter } from "@/prototype-app/presenter";
import "@/styles/globals.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Presenter />
    </StrictMode>,
);
