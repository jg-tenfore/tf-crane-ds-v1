import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.join(dirname, "src") } },
    // addon-vitest's setup file does named imports from CJS-only packages; pre-bundle
    // them or every story suite dies on import.
    optimizeDeps: {
        include: ["aria-query", "lz-string", "dom-accessibility-api", "css.escape", "pretty-format"],
    },
});
